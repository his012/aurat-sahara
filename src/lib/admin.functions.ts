import { createServerFn } from "@tanstack/react-start";

export type AdminRequest = {
  id: string;
  user_id: string;
  full_name: string | null;
  skill: string | null;
  age: number | null;
  city: string | null;
  cnic_number: string | null;
  status: "pending" | "approved" | "declined";
  work_proof_urls: string[];
  thumb_urls: string[];
  comment: string | null;
  created_at: string;
};

export const getAllRequests = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminRequest[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("certificate_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    const result: AdminRequest[] = [];
    for (const row of data) {
      const thumbs: string[] = [];
      for (const path of row.work_proof_urls ?? []) {
        const { data: signed } = await supabaseAdmin.storage
          .from("work-proofs")
          .createSignedUrl(path, 60 * 60);
        if (signed?.signedUrl) thumbs.push(signed.signedUrl);
      }
      result.push({ ...(row as any), thumb_urls: thumbs });
    }
    return result;
  },
);

type ActionInput = {
  action: "approve" | "decline";
  request_id: string;
  comment?: string;
};

export const adminAction = createServerFn({ method: "POST" })
  .inputValidator((data: ActionInput) => data)
  .handler(async ({ data }) => {
    if (data.action === "decline" && !data.comment?.trim()) {
      return { ok: false, error: "A reason is required to decline." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error: fetchErr } = await supabaseAdmin
      .from("certificate_requests")
      .select("id, user_id, skill")
      .eq("id", data.request_id)
      .single();

    if (fetchErr || !row) return { ok: false, error: "Request not found." };

    const newStatus = data.action === "approve" ? "approved" : "declined";

    const { error: updateErr } = await supabaseAdmin
      .from("certificate_requests")
      .update({ status: newStatus, comment: data.comment?.trim() ?? null })
      .eq("id", data.request_id);

    if (updateErr) return { ok: false, error: "Could not update the request." };

    const skill = row.skill ?? "your skill";
    const title =
      newStatus === "approved" ? "Application approved ✓" : "Application declined";
    const body =
      newStatus === "approved"
        ? `Congratulations! Your certificate request for "${skill}" was approved.`
        : `Your certificate request for "${skill}" was declined. Reason: ${data.comment?.trim()}`;

    await supabaseAdmin.from("notifications").insert({
      user_id: row.user_id,
      title,
      body,
      type: newStatus,
    });

    return { ok: true };
  });
