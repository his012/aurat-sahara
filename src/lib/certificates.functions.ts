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
  issue_date: string;
  uuid_verify: string;
};

/**
 * Fetch a certificate by id for public display (the certificate page is
 * shareable). Returns only non-sensitive presentation fields.
 */
export const getCertificate = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<CertificateView | null> => {
    const id = (data.id ?? "").trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) return null;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: cert, error } = await supabaseAdmin
      .from("certificates")
      .select("id, full_name, skill, issue_date, uuid_verify")
      .eq("id", id)
      .maybeSingle();

    if (error || !cert) return null;
    return cert as CertificateView;
  });
