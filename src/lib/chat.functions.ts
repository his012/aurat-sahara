import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type ChatMessage = { role: "user" | "assistant"; content: string };

type GrokInput = {
  messages: ChatMessage[];
  image_urls?: string[];
  cnic_image_urls?: string[];
  forceSubmit?: boolean;
  lang?: string;
};

type Collected = {
  skill: string | null;
  full_name: string | null;
  age: number | null;
  education: string | null;
  experience: string | null;
  cnic_number: string | null;
};

const LANG_INSTRUCTION: Record<string, string> = {
  ur: "Reply ONLY in Urdu (Nastaliq script).",
  roman: "Reply ONLY in Roman Urdu (Urdu written with English letters).",
  en: "Reply ONLY in simple English.",
};

const SUCCESS_MSG: Record<string, string> = {
  ur: "آپ کی درخواست جمع ہو گئی! نوٹیفیکیشن میں اپڈیٹ ملے گی۔",
  roman: "Aapki application submit ho gayi! Notification mein update milegi.",
  en: "Your application has been submitted! You'll get an update in notifications.",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const EXTRACT_TOOL = {
  type: "function",
  function: {
    name: "report_collected",
    description:
      "Report which application details have been collected so far from the conversation. Use null for anything not yet clearly provided by the user.",
    parameters: {
      type: "object",
      properties: {
        skill: { type: ["string", "null"] },
        full_name: { type: ["string", "null"] },
        age: { type: ["integer", "null"] },
        education: { type: ["string", "null"] },
        experience: { type: ["string", "null"] },
        cnic_number: { type: ["string", "null"] },
      },
      required: [],
    },
  },
};

async function extractCollected(
  apiKey: string,
  messages: ChatMessage[],
): Promise<Collected> {
  const empty: Collected = {
    skill: null,
    full_name: null,
    age: null,
    education: null,
    experience: null,
    cnic_number: null,
  };
  try {
    const res = await fetch(AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Extract the certificate application details the user has provided so far. Call report_collected with whatever is known, using null for missing items.",
          },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        tools: [EXTRACT_TOOL],
        tool_choice: { type: "function", function: { name: "report_collected" } },
      }),
    });
    if (!res.ok) return empty;
    const json = await res.json();
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return empty;
    const parsed = JSON.parse(args);
    return {
      skill: parsed.skill ?? null,
      full_name: parsed.full_name ?? null,
      age: parsed.age != null ? Number(parsed.age) : null,
      education: parsed.education ?? null,
      experience: parsed.experience ?? null,
      cnic_number: parsed.cnic_number ?? null,
    };
  } catch {
    return empty;
  }
}

export const grokChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: GrokInput) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const lang = data.lang ?? "en";
    const imageUrls = data.image_urls ?? [];
    const apiKey = process.env.LOVABLE_API_KEY;

    const noCollected: Collected = {
      skill: null,
      full_name: null,
      age: null,
      education: null,
      experience: null,
      cnic_number: null,
    };

    if (!apiKey) {
      return {
        reply: "AI service is not configured.",
        applicationSubmitted: false,
        collected: noCollected,
      };
    }

    // Resolve any storage paths into signed URLs the model can read.
    const resolvedImageUrls: string[] = [];
    for (const ref of imageUrls) {
      if (/^https?:\/\//i.test(ref)) {
        resolvedImageUrls.push(ref);
        continue;
      }
      const { data: signed } = await supabase.storage
        .from("portfolio-images")
        .createSignedUrl(ref, 60 * 30);
      if (signed?.signedUrl) resolvedImageUrls.push(signed.signedUrl);
    }

    // ---- Force submit path ----
    if (data.forceSubmit) {
      const collected = await extractCollected(apiKey, data.messages);

      const { supabaseAdmin } = await import(
        "@/integrations/supabase/client.server"
      );

      const { error } = await supabaseAdmin.from("certificate_requests").insert({
        user_id: userId,
        full_name: collected.full_name,
        skill: collected.skill,
        age: collected.age,
        education: collected.education,
        experience: collected.experience,
        cnic_number: collected.cnic_number,
        work_proof_urls: imageUrls,
        cnic_image_urls: data.cnic_image_urls ?? [],
        status: "pending",
      });

      if (error) {
        return {
          reply: "I couldn't save your application. Please try again.",
          applicationSubmitted: false,
          collected,
        };
      }

      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        title: "Application received",
        body: `Your certificate request for "${collected.skill ?? "your skill"}" is under review.`,
        type: "info",
      });

      return {
        reply: SUCCESS_MSG[lang] ?? SUCCESS_MSG.en,
        applicationSubmitted: true,
        collected,
      };
    }

    // ---- Normal conversational path ----
    const cnicLine: Record<string, string> = {
      ur: "شکریہ! اب براہِ کرم اپنے شناختی کارڈ (CNIC) کے دونوں طرف کی تصاویر اپلوڈ کریں — سامنے اور پیچھے۔",
      roman: "Shukriya! Ab please apne CNIC ki dono sides upload karein — front aur back.",
      en: "Thank you! Now please upload both sides of your CNIC — front and back.",
    };
    const system = `You are "Aurat Sahara AI", a warm, respectful assistant that helps women in Pakistan apply for a skill certificate.
${LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.en}
Collect these details ONE question at a time, in a friendly conversational way:
1. skill (the skill they want a certificate for)
2. full_name
3. age
4. education
5. experience (their work experience with this skill)
6. cnic_number (13 digit Pakistani CNIC)
After the user provides their CNIC number, your VERY NEXT reply MUST be exactly this line (do NOT add anything else): "${cnicLine[lang] ?? cnicLine.en}"
The user will then upload front and back CNIC images via a special upload area shown in the UI — do not ask for them as text.
Also ask them to attach at least 3 photos as proof of their work.
Keep messages short and encouraging. Do NOT claim the application is submitted yourself — the system handles submission automatically once everything is ready.`;

    const chatMessages: any[] = [{ role: "system", content: system }];
    data.messages.forEach((m, idx) => {
      const isLast = idx === data.messages.length - 1;
      if (isLast && m.role === "user" && resolvedImageUrls.length > 0) {
        chatMessages.push({
          role: "user",
          content: [
            { type: "text", text: m.content || "Here are my work proof images." },
            ...resolvedImageUrls.map((url) => ({
              type: "image_url",
              image_url: { url },
            })),
          ],
        });
      } else {
        chatMessages.push({ role: m.role, content: m.content });
      }
    });

    let res: Response;
    try {
      res = await fetch(AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: chatMessages,
        }),
      });
    } catch {
      return {
        reply: "Network error contacting AI. Please try again.",
        applicationSubmitted: false,
        collected: noCollected,
      };
    }

    if (res.status === 429) {
      return {
        reply: "Too many requests right now. Please try again in a moment.",
        applicationSubmitted: false,
        collected: noCollected,
      };
    }
    if (res.status === 402) {
      return {
        reply: "AI credits are exhausted. Please contact the administrator.",
        applicationSubmitted: false,
        collected: noCollected,
      };
    }
    if (!res.ok) {
      return {
        reply: "Sorry, something went wrong with the AI. Please try again.",
        applicationSubmitted: false,
        collected: noCollected,
      };
    }

    const json = await res.json();
    const reply = json.choices?.[0]?.message?.content ?? "...";

    // Track progress so the client knows when to auto-submit.
    const collected = await extractCollected(apiKey, [
      ...data.messages,
      { role: "assistant", content: reply },
    ]);

    return { reply, applicationSubmitted: false, collected };
  });
