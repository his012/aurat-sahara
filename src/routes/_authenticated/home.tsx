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

const HOME_TAGLINES = {
  en: "Empowering Pakistani women by recognizing their skills and connecting them to official certification pathways.",
  ur: "پاکستانی خواتین کی مہارتوں کو تسلیم کر کے انہیں سرکاری سرٹیفکیٹ تک پہنچانا۔",
  roman:
    "Pakistani khawateen ki skills ko pehchan de kar unhe official certificate tak pohanchana.",
};

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
      className="home-page relative flex min-h-screen flex-col overflow-hidden"
    >
      <section className="home-brand-section relative z-10 w-full px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-5 sm:gap-8">
          <img
            src={mark}
            alt="Aurat Sahara emblem"
            width={1024}
            height={1024}
            className="h-28 w-28 shrink-0 object-contain sm:h-36 sm:w-36"
          />
          <div className={rtl ? "text-right" : "text-left"}>
            <h1 className="aurat-display text-3xl font-bold text-primary sm:text-4xl">
              Aurat Sahara
            </h1>
            <p
              className="mt-2 max-w-md text-sm leading-relaxed text-foreground/70 sm:text-base"
              style={fontStyle}
            >
              {HOME_TAGLINES[lang]}
            </p>
          </div>
        </div>
      </section>

      <section className="home-swirl relative flex flex-1 flex-col overflow-hidden px-6 py-6">
        <div className="home-swirl-orb home-swirl-orb-one" />
        <div className="home-swirl-orb home-swirl-orb-two" />

        {/* Existing home controls */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            aria-label="Admin access"
            onClick={() => setLockOpen(true)}
            className="rounded-full border border-transparent p-2 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Lock size={18} />
          </button>

          <button
            aria-label="Notifications"
            onClick={() => navigate({ to: "/notifications" })}
            className="relative rounded-full border border-transparent p-2 text-primary-foreground transition-colors hover:bg-primary-foreground/10"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground shadow-sm">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-8 text-center">
        <img
          src={mark}
          alt=""
          aria-hidden="true"
          className="mb-2 h-16 w-16 object-contain opacity-80"
          />
          <div
          className="aurat-card aurat-rise w-full rounded-3xl p-6 text-base leading-relaxed"
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

        <p className="relative z-10 mt-auto text-center text-xs text-primary-foreground/80">
          Maham Lodhi &amp; Farhan Shoukat
        </p>
      </section>

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
