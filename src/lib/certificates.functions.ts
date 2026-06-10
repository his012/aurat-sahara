import { createServerFn } from "@tanstack/react-start";

export type VerifyResult = {
  valid: boolean;
  full_name: string | null;
  skill: string | null;
  issue_date: string | null;
};

/**
 * Public verification — no auth required. Looks up a certificate by its
 * public verification UUID using the admin client (RLS bypassed, but only
 * non-sensitive fields are returned).
 */
export const verifyCertificate = createServerFn({ method: "GET" })
  .inputValidator((data: { uuid: string }) => data)
  .handler(async ({ data }): Promise<VerifyResult> => {
    const uuid = (data.uuid ?? "").trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(uuid)) {
      return { valid: false, full_name: null, skill: null, issue_date: null };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: cert, error } = await supabaseAdmin
      .from("certificates")
      .select("full_name, skill, issue_date")
      .eq("uuid_verify", uuid)
      .maybeSingle();

    if (error || !cert) {
      return { valid: false, full_name: null, skill: null, issue_date: null };
    }

    return {
      valid: true,
      full_name: cert.full_name,
      skill: cert.skill,
      issue_date: cert.issue_date,
    };
  });

export type CertificateView = {
  id: string;
  full_name: string | null;
  skill: string | null;
  full_name_ur: string | null;
  skill_ur: string | null;
  issue_date: string;
  uuid_verify: string;
};

/**
 * Transliterate/translate the name and skill into Urdu (Nastaliq) script via
 * the Lovable AI gateway. Names are transliterated phonetically; skills are
 * translated to their common Urdu term. Returns nulls on any failure.
 */
async function toUrdu(
  fullName: string | null,
  skill: string | null,
): Promise<{ full_name_ur: string | null; skill_ur: string | null }> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey || (!fullName && !skill)) {
    return { full_name_ur: null, skill_ur: null };
  }
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              "You convert text to Urdu (Nastaliq/Arabic script) for a certificate. Transliterate the person's NAME phonetically into Urdu script. Translate the SKILL into its common Urdu term. Respond ONLY with a JSON object: {\"full_name_ur\": string|null, \"skill_ur\": string|null}. No extra text.",
          },
          {
            role: "user",
            content: `name: ${fullName ?? ""}\nskill: ${skill ?? ""}`,
          },
        ],
      }),
    });
    if (!res.ok) return { full_name_ur: null, skill_ur: null };
    const json = await res.json();
    let content: string = json.choices?.[0]?.message?.content ?? "";
    content = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(content);
    return {
      full_name_ur: parsed.full_name_ur ?? null,
      skill_ur: parsed.skill_ur ?? null,
    };
  } catch {
    return { full_name_ur: null, skill_ur: null };
  }
}

/**
 * Fetch a certificate by id for public display (the certificate page is
 * shareable). Returns only non-sensitive presentation fields. The Urdu
 * versions of the name and skill are generated lazily on first view and
 * cached back to the row.
 */
export const getCertificate = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<CertificateView | null> => {
    const id = (data.id ?? "").trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) return null;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: cert, error } = await supabaseAdmin
      .from("certificates")
      .select("id, full_name, skill, full_name_ur, skill_ur, issue_date, uuid_verify")
      .eq("id", id)
      .maybeSingle();

    if (error || !cert) return null;

    let result = cert as CertificateView;

    // Generate and cache the Urdu versions on first view.
    if (!result.full_name_ur && !result.skill_ur && (result.full_name || result.skill)) {
      const urdu = await toUrdu(result.full_name, result.skill);
      if (urdu.full_name_ur || urdu.skill_ur) {
        await supabaseAdmin
          .from("certificates")
          .update({ full_name_ur: urdu.full_name_ur, skill_ur: urdu.skill_ur })
          .eq("id", id);
        result = { ...result, ...urdu };
      }
    }

    return result;
  });
