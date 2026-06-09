import { useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { getLang, isRtl, t } from "@/lib/i18n";
import mark from "@/assets/mark.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In · Aurat Sahara" },
      {
        name: "description",
        content: "Create an account or sign in to Aurat Sahara.",
      },
    ],
  }),
  component: AuthPage,
});

const inputStyle: React.CSSProperties = {
  minHeight: "52px",
  borderColor: "#E0BFD0",
  borderRadius: "14px",
};

function AuthPage() {
  const navigate = useNavigate();
  const lang = useMemo(getLang, []);
  const tr = t(lang);
  const rtl = isRtl(lang);
  const [tab, setTab] = useState<"signup" | "signin">("signup");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(tr.passwordsNoMatch);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/home` },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/home" });
    } else {
      toast.success(tr.accountCreated);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/home" });
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error(tr.enterEmailFirst);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(tr.resetLinkSent);
  };

  const fontStyle = rtl ? { fontFamily: "var(--font-urdu)" } : undefined;

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="aurat-page relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12"
    >
      <Toaster />
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#e08ca8]/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#c9a84c]/12 blur-3xl" />

      <div className="relative mb-6 flex flex-col items-center text-center">
        <img
          src={mark}
          alt="Aurat Sahara"
          width={1024}
          height={1024}
          className="h-20 w-20 object-contain"
        />
        <h1
          className="aurat-display mt-2 text-3xl font-bold"
          style={{ color: "#8B2252" }}
        >
          Aurat Sahara
        </h1>
      </div>

      <div className="aurat-card aurat-rise relative w-full max-w-sm rounded-3xl p-6">
        {/* Tabs */}
        <div
          className="mb-6 grid grid-cols-2 gap-1 rounded-2xl p-1"
          style={{ backgroundColor: "#F4E3EC" }}
        >
          {(["signup", "signin"] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className="rounded-xl py-2.5 text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === tabKey ? "#FFFFFF" : "transparent",
                color: tab === tabKey ? "#8B2252" : "#A88E9B",
                boxShadow: tab === tabKey ? "0 6px 16px -10px rgba(139,34,82,0.5)" : "none",
                ...fontStyle,
              }}
            >
              {tabKey === "signup" ? tr.signUp : tr.signIn}
            </button>
          ))}
        </div>

        {tab === "signup" ? (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder={tr.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border bg-white/80 px-4 text-base outline-none transition focus:border-[#C2587A] focus:ring-2 focus:ring-[#C2587A]/20"
              style={inputStyle}
            />
            <input
              type="password"
              required
              placeholder={tr.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border bg-white/80 px-4 text-base outline-none transition focus:border-[#C2587A] focus:ring-2 focus:ring-[#C2587A]/20"
              style={inputStyle}
            />
            <input
              type="password"
              required
              placeholder={tr.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border bg-white/80 px-4 text-base outline-none transition focus:border-[#C2587A] focus:ring-2 focus:ring-[#C2587A]/20"
              style={inputStyle}
            />
            <SubmitButton loading={loading} label={tr.signUp} fontStyle={fontStyle} pleaseWait={tr.pleaseWait} />
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder={tr.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border bg-white/80 px-4 text-base outline-none transition focus:border-[#C2587A] focus:ring-2 focus:ring-[#C2587A]/20"
              style={inputStyle}
            />
            <input
              type="password"
              required
              placeholder={tr.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border bg-white/80 px-4 text-base outline-none transition focus:border-[#C2587A] focus:ring-2 focus:ring-[#C2587A]/20"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={handleForgotPassword}
              className="self-end text-sm font-medium hover:underline"
              style={{ color: "#A3206A", ...fontStyle }}
            >
              {tr.forgotPassword}
            </button>
            <SubmitButton loading={loading} label={tr.signIn} fontStyle={fontStyle} pleaseWait={tr.pleaseWait} />
          </form>
        )}
      </div>

      <Link to="/" className="relative mt-6 text-sm hover:underline" style={{ color: "#9A8694", ...fontStyle }}>
        {tr.changeLanguage}
      </Link>
    </div>
  );
}

function SubmitButton({
  loading,
  label,
  fontStyle,
  pleaseWait,
}: {
  loading: boolean;
  label: string;
  fontStyle?: React.CSSProperties;
  pleaseWait: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="aurat-btn mt-1 w-full rounded-full font-semibold"
      style={{ height: "52px", ...fontStyle }}
    >
      {loading ? pleaseWait : label}
    </button>
  );
}
