import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, Lock } from "lucide-react";
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
      toast.error("Ghalat password.");
    }
  };

  return (
    <div className="min-h-screen px-6 py-6" style={{ backgroundColor: "#FAF5EE" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          aria-label="Admin access"
          onClick={() => setLockOpen(true)}
          className="rounded-full p-2 text-[#B89AAB] transition-colors hover:bg-[#F0E3EC] hover:text-[#8B2252]"
        >
          <Lock size={18} />
        </button>

        <button
          aria-label="Notifications"
          onClick={() => navigate({ to: "/notifications" })}
          className="relative rounded-full p-2 text-[#8B2252] transition-colors hover:bg-[#F0E3EC]"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Center content */}
      <div className="mx-auto flex max-w-md flex-col items-center pt-20 text-center">
        <h1
          className="text-5xl font-bold"
          style={{ color: "#8B2252", fontFamily: "var(--font-display)" }}
        >
          Aurat Sahara
        </h1>

        <div
          className="mt-10 w-full rounded-2xl border bg-white/60 p-6 text-base leading-relaxed"
          style={{ borderColor: "#F0C9DD", color: "#6B5563" }}
        >
          AI ke zariye apni skill ka certificate apply karein. Hum aapki application review karenge
          aur approve ya comment ke saath notification bhej denge.
        </div>

        <button
          onClick={() => navigate({ to: "/apply" })}
          className="mt-10 w-full rounded-full px-8 text-lg font-semibold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "#C2587A", height: "56px" }}
        >
          Shuru Karein — شروع کریں
        </button>
      </div>

      {/* Admin password modal */}
      <Dialog open={lockOpen} onOpenChange={setLockOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle style={{ color: "#8B2252" }}>Admin Access</DialogTitle>
            <DialogDescription>Enter the password to continue.</DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="Password"
            style={{ minHeight: "48px", borderColor: "#D4A0B8", borderRadius: "12px" }}
            autoFocus
          />
          <button
            onClick={handleUnlock}
            className="mt-2 w-full rounded-full px-6 py-3 font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#C2587A" }}
          >
            Unlock
          </button>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
