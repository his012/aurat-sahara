import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, Lock, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getLang, isRtl, t } from "@/lib/i18n";
import mark from "@/assets/mark.png";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Home · Aurat Sahara" },
      { name: "description", content: "Apply for your skill certificate with Aurat Sahara." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const lang = useMemo(getLang, []);
  const tr = t(lang);
  const rtl = isRtl(lang);
  const fontStyle = rtl ? { fontFamily: "var(--font-urdu)" } : undefined;
  const [lockOpen, setLockOpen] = useState(false);
  const [password, setPassword] = useState("");

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return 0;
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (error) return 0;
      return count ?? 0;
    },
  });

  const handleUnlock = () => {
    if (password === "123") {
      setLockOpen(false);
      setPassword("");
      navigate({ to: "/admin" });
    } else {
      toast.error(tr.wrongPassword);
    }
  };

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="aurat-page relative min-h-screen overflow-hidden px-6 py-6"
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-24 -top-10 h-80 w-80 rounded-full bg-[#e08ca8]/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[#c9a84c]/12 blur-3xl" />

      {/* Top bar */}
      <div className="relative flex items-center justify-between">
        <button
          aria-label="Admin access"
          onClick={() => setLockOpen(true)}
          className="rounded-full border border-transparent p-2 text-[#B89AAB] transition-colors hover:border-[#F0C9DD] hover:bg-white/60 hover:text-[#8B2252]"
        >
          <Lock size={18} />
        </button>

        <button
          aria-label="Notifications"
          onClick={() => navigate({ to: "/notifications" })}
          className="relative rounded-full border border-transparent p-2 text-[#8B2252] transition-colors hover:border-[#F0C9DD] hover:bg-white/60"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Center content */}
      <div className="relative mx-auto flex max-w-md flex-col items-center pt-10 text-center">
        <img
          src={mark}
          alt="Aurat Sahara emblem"
          width={1024}
          height={1024}
          className="aurat-float h-40 w-40 object-contain drop-shadow-[0_18px_30px_rgba(139,34,82,0.18)]"
        />

        <h1
          className="aurat-display mt-2 text-5xl font-bold"
          style={{ color: "#8B2252" }}
        >
          Aurat Sahara
        </h1>

        <div className="mt-3 h-px w-32 aurat-divider" />

        <div
          className="aurat-card aurat-rise mt-8 w-full rounded-3xl p-6 text-base leading-relaxed"
          style={{ color: "var(--aurat-ink)", ...fontStyle }}
        >
          <Sparkles
            size={22}
            className="mx-auto mb-3"
            style={{ color: "var(--aurat-gold)" }}
          />
          {tr.homeIntro}
        </div>

        <button
          onClick={() => navigate({ to: "/apply" })}
          className="aurat-btn mt-8 flex w-full items-center justify-center gap-2 rounded-full px-8 text-lg font-semibold"
          style={{ height: "58px", ...fontStyle }}
        >
          {tr.startBtn}
          <ArrowRight size={20} className={rtl ? "rotate-180" : ""} />
        </button>
      </div>

      {/* Admin password modal */}
      <Dialog open={lockOpen} onOpenChange={setLockOpen}>
        <DialogContent className="max-w-xs rounded-3xl border-[#F0C9DD]">
          <DialogHeader>
            <DialogTitle style={{ color: "#8B2252", ...fontStyle }}>{tr.adminAccess}</DialogTitle>
            <DialogDescription style={fontStyle}>{tr.adminEnterPassword}</DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder={tr.password}
            style={{ minHeight: "48px", borderColor: "#D4A0B8", borderRadius: "12px" }}
            autoFocus
          />
          <button
            onClick={handleUnlock}
            className="aurat-btn mt-2 w-full rounded-full px-6 py-3 font-semibold"
            style={fontStyle}
          >
            {tr.unlock}
          </button>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
