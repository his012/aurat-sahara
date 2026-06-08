import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Info, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { getLang, isRtl, t } from "@/lib/i18n";

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

      const certByRequest: Record<string, string> = {};
      for (const c of certs ?? []) {
        if (c.request_id) certByRequest[c.request_id] = c.id;
      }

      return { notifications: (notifs ?? []) as Notification[], certByRequest };
    },
  });

  const notifications = data?.notifications ?? [];
  const certByRequest = data?.certByRequest ?? {};
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
      toast.error("Could not update notifications.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    toast.success("All notifications marked as read.");
  };

  return (
    <div className="min-h-screen px-4 py-6" style={{ backgroundColor: "#FAF5EE" }}>
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: "#8B2252" }}
          >
            <ArrowLeft size={16} /> Home
          </button>
          {hasUnread && (
            <button
              onClick={markAllRead}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "#C2587A" }}
            >
              Mark all as read
            </button>
          )}
        </div>

        <h1
          className="mb-6 text-3xl font-bold"
          style={{ color: "#8B2252", fontFamily: "var(--font-display)" }}
        >
          Notifications
        </h1>

        {isLoading ? (
          <p style={{ color: "#8B2252" }}>Loading…</p>
        ) : notifications.length === 0 ? (
          <p style={{ color: "#7A6470" }}>No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const certId = n.request_id ? certByRequest[n.request_id] : undefined;
              return (
                <div
                  key={n.id}
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "#F0C9DD",
                    backgroundColor: n.is_read ? "#FFFFFF" : "#FBE9F2",
                  }}
                >
                  <div className="flex items-start gap-3">
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
                      <p className="font-semibold" style={{ color: "#5B4750" }}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="mt-1 text-sm" style={{ color: "#7A6470" }}>
                          {n.body}
                        </p>
                      )}
                      <p className="mt-2 text-xs" style={{ color: "#9A7E8C" }}>
                        {formatDate(n.created_at)}
                      </p>

                      {n.type === "approved" && certId && (
                        <Link
                          to="/certificate/$id"
                          params={{ id: certId }}
                          className="mt-3 inline-block rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
                          style={{ backgroundColor: "#C2587A" }}
                        >
                          View Certificate
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
