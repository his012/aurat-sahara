import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type ChatMessage = { role: "user" | "assistant"; content: string };

type GrokInput = {
  messages: ChatMessage[];
  image_paths?: string[];
  lang?: string;
};

const LANG_INSTRUCTION: Record<string, string> = {
  ur: "Reply ONLY in Urdu (Nastaliq script).",
  roman: "Reply ONLY in Roman Urdu (Urdu written with English letters).",
  en: "Reply ONLY in simple English.",
};

const SUCCESS_MSG: Record<string, string> = {
  ur: "شکریہ! آپ کی درخواست جمع ہو گئی ہے۔ ہم جلد جائزہ لے کر آپ کو مطلع کریں گے۔",
  roman:
    "Shukriya! Aap ki application jama ho gayi hai. Hum jald review kar ke aap ko notification bhej denge.",
  en: "Thank you! Your application has been submitted. We'll review it and notify you soon.",
};

export const grokChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: GrokInput) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const lang = data.lang ?? "en";
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reply: "AI service is not configured.", applicationSubmitted: false };
    }

    // Generate signed URLs for any uploaded image paths so the model can see them.
    const imageUrls: string[] = [];
    for (const path of data.image_paths ?? []) {
      const { data: signed } = await supabase.storage
        .from("work-proofs")
        .createSignedUrl(path, 60 * 30);
      if (signed?.signedUrl) imageUrls.push(signed.signedUrl);
    }

    const system = `You are "Aurat Sahara AI", a warm, respectful assistant that helps women in Pakistan apply for a skill certificate.
${LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.en}
Collect these details ONE question at a time, in a friendly conversational way:
1. skill (the skill they want a certificate for)
2. full_name
3. age
4. city
5. cnic_number (13 digit Pakistani CNIC)
Also ask them to attach at least one photo as proof of their work.
When you have ALL five details AND the user has attached at least one work-proof image, call the submit_application tool. Do not call it before you have everything. Keep messages short and encouraging.`;

    const chatMessages: any[] = [{ role: "system", content: system }];
    data.messages.forEach((m, idx) => {
      const isLast = idx === data.messages.length - 1;
      if (isLast && m.role === "user" && imageUrls.length > 0) {
        chatMessages.push({
          role: "user",
          content: [
            { type: "text", text: m.content || "Here are my work proof images." },
            ...imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
          ],
        });
      } else {
        chatMessages.push({ role: m.role, content: m.content });
      }
    });

    const tools = [
      {
        type: "function",
        function: {
          name: "submit_application",
          description:
            "Submit the certificate application once skill, full_name, age, city, cnic_number are known and at least one work proof image was attached.",
          parameters: {
            type: "object",
            properties: {
              full_name: { type: "string" },
              skill: { type: "string" },
              age: { type: "integer" },
              city: { type: "string" },
              cnic_number: { type: "string" },
            },
            required: ["full_name", "skill", "age", "city", "cnic_number"],
          },
        },
      },
    ];

    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: chatMessages,
          tools,
          tool_choice: "auto",
        }),
      });
    } catch {
      return { reply: "Network error contacting AI. Please try again.", applicationSubmitted: false };
    }

    if (res.status === 429) {
      return { reply: "Too many requests right now. Please try again in a moment.", applicationSubmitted: false };
    }
    if (res.status === 402) {
      return { reply: "AI credits are exhausted. Please contact the administrator.", applicationSubmitted: false };
    }
    if (!res.ok) {
      return { reply: "Sorry, something went wrong with the AI. Please try again.", applicationSubmitted: false };
    }

    const json = await res.json();
    const message = json.choices?.[0]?.message;
    const toolCall = message?.tool_calls?.[0];

    if (toolCall?.function?.name === "submit_application") {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(toolCall.function.arguments ?? "{}");
      } catch {
        args = {};
      }

      const { error } = await supabase.from("certificate_requests").insert({
        user_id: userId,
        full_name: (args.full_name as string) ?? null,
        skill: (args.skill as string) ?? null,
        age: args.age != null ? Number(args.age) : null,
        city: (args.city as string) ?? null,
        cnic_number: (args.cnic_number as string) ?? null,
        work_proof_urls: data.image_paths ?? [],
        status: "pending",
      });

      if (error) {
        return {
          reply: "I couldn't save your application. Please try again.",
          applicationSubmitted: false,
        };
      }

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Application received",
        body: `Your certificate request for "${args.skill ?? "your skill"}" is under review.`,
        type: "info",
      });

      return { reply: SUCCESS_MSG[lang] ?? SUCCESS_MSG.en, applicationSubmitted: true };
    }

    return {
      reply: message?.content ?? "...",
      applicationSubmitted: false,
    };
  });
