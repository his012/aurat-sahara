import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Info, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { getLang, isRtl, t, notifTitle, notifBody } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · Aurat Sahara" },
      { name: "description", content: "Your Aurat Sahara application updates and certificate notifications." },
    ],
  }),
  component: Notifications,
});

type Notification = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
  request_id: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const lang = useMemo(getLang, []);
  const tr = t(lang);
  const rtl = isRtl(lang);
  const fontStyle = rtl ? { fontFamily: "var(--font-urdu)" } : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return { notifications: [] as Notification[], certByRequest: {} as Record<string, string> };

      const { data: notifs } = await supabase
        .from("notifications")
        .select("id, title, body, type, is_read, created_at, request_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const { data: certs } = await supabase
        .from("certificates")
        .select("id, request_id")
        .eq("user_id", userId);

      const { data: requests } = await supabase
        .from("certificate_requests")
        .select("id, skill, comment")
        .eq("user_id", userId);

      const certByRequest: Record<string, string> = {};
      for (const c of certs ?? []) {
        if (c.request_id) certByRequest[c.request_id] = c.id;
      }

      const reqInfo: Record<string, { skill: string | null; comment: string | null }> = {};
      for (const r of requests ?? []) {
        reqInfo[r.id] = { skill: r.skill, comment: r.comment };
      }

      return {
        notifications: (notifs ?? []) as Notification[],
        certByRequest,
        reqInfo,
      };
    },
  });

  const notifications = data?.notifications ?? [];
  const certByRequest = data?.certByRequest ?? {};
  const reqInfo = data?.reqInfo ?? {};
  const hasUnread = notifications.some((n) => !n.is_read);

  const markAllRead = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) {
      toast.error(tr.notifUpdateFailed);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    toast.success(tr.allMarkedRead);
  };

  const accent = (type: string) =>
    type === "approved" ? "#27AE60" : type === "declined" ? "#E74C3C" : "#A3206A";

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="aurat-page relative min-h-screen overflow-hidden px-4 py-6">
      <div className="pointer-events-none absolute -right-24 -top-10 h-72 w-72 rounded-full bg-[#e08ca8]/15 blur-3xl" />

      <div className="relative mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="flex items-center gap-1.5 rounded-full border bg-white/60 px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition hover:bg-white"
            style={{ color: "#8B2252", borderColor: "var(--aurat-line)", ...fontStyle }}
          >
            <ArrowLeft size={16} className={rtl ? "rotate-180" : ""} /> {tr.home}
          </button>
          {hasUnread && (
            <button
              onClick={markAllRead}
              className="aurat-btn rounded-full px-4 py-2 text-sm font-semibold"
              style={fontStyle}
            >
              {tr.markAllRead}
            </button>
          )}
        </div>

        <h1 className="aurat-display mb-1 text-3xl font-bold" style={{ color: "#8B2252" }}>
          {tr.notifications}
        </h1>
        <div className="mb-6 h-px w-24 aurat-divider" />

        {isLoading ? (
          <p style={{ color: "#8B2252", ...fontStyle }}>{tr.loading}</p>
        ) : notifications.length === 0 ? (
          <div className="aurat-card rounded-3xl p-10 text-center">
            <Info size={28} className="mx-auto mb-3" style={{ color: "var(--aurat-gold)" }} />
            <p style={{ color: "#7A6470", ...fontStyle }}>{tr.noNotifications}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const certId = n.request_id ? certByRequest[n.request_id] : undefined;
              const info = n.request_id ? reqInfo[n.request_id] : undefined;
              const title = notifTitle(lang, n.type);
              const body = notifBody(lang, n.type, {
                skill: info?.skill,
                reason: info?.comment,
              });
              return (
                <div
                  key={n.id}
                  className="aurat-rise relative overflow-hidden rounded-2xl p-4"
                  style={{
                    border: `1px solid ${n.is_read ? "var(--aurat-line)" : "#F2B6D2"}`,
                    backgroundColor: n.is_read ? "rgba(255,255,255,0.7)" : "#FBE9F2",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1"
                    style={{ backgroundColor: accent(n.type) }}
                  />
                  <div className="flex items-start gap-3 pl-1">
                    <div className="mt-0.5 shrink-0">
                      {n.type === "approved" ? (
                        <CheckCircle2 size={22} style={{ color: "#27AE60" }} />
                      ) : n.type === "declined" ? (
                        <XCircle size={22} style={{ color: "#E74C3C" }} />
                      ) : (
                        <Info size={22} style={{ color: "#A3206A" }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: "var(--aurat-ink)", ...fontStyle }}>
                        {title || n.title}
                      </p>
                      {(body || n.body) && (
                        <p className="mt-1 text-sm" style={{ color: "#7A6470", ...fontStyle }}>
                          {body || n.body}
                        </p>
                      )}
                      <p className="mt-2 text-xs" style={{ color: "var(--aurat-muted)" }}>
                        {formatDate(n.created_at)}
                      </p>

                      {n.type === "approved" && certId && (
                        <Link
                          to="/certificate/$id"
                          params={{ id: certId }}
                          className="aurat-btn mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
                          style={fontStyle}
                        >
                          {tr.viewCertificate}
                          <ArrowRight size={15} className={rtl ? "rotate-180" : ""} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Toaster />
    </div>
  );
}
