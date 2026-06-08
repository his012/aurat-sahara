import { useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { getLang, isRtl, t } from "@/lib/i18n";

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
  borderColor: "#D4A0B8",
  borderRadius: "12px",
};

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signup" | "signin">("signup");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
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
      toast.success("Account created! Check your email to confirm your address.");
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
      toast.error("Enter your email above first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset link sent to your email.");
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: "#FAF5EE" }}
    >
      <Toaster />
      <h1
        className="mb-8 text-center text-3xl font-bold"
        style={{ color: "#8B2252", fontFamily: "var(--font-display)" }}
      >
        Aurat Sahara
      </h1>

      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm"
        style={{ border: "1px solid #EADFD3" }}
      >
        {/* Tabs */}
        <div
          className="mb-6 grid grid-cols-2 gap-1 rounded-xl p-1"
          style={{ backgroundColor: "#F4E8DF" }}
        >
          {(["signup", "signin"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-lg py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: tab === t ? "#FFFFFF" : "transparent",
                color: tab === t ? "#8B2252" : "#9A8694",
              }}
            >
              {t === "signup" ? "Sign Up" : "Sign In"}
            </button>
          ))}
        </div>

        {tab === "signup" ? (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border bg-white px-4 text-base outline-none focus:ring-2"
              style={inputStyle}
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border bg-white px-4 text-base outline-none focus:ring-2"
              style={inputStyle}
            />
            <input
              type="password"
              required
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border bg-white px-4 text-base outline-none focus:ring-2"
              style={inputStyle}
            />
            <SubmitButton loading={loading} label="Sign Up" />
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border bg-white px-4 text-base outline-none focus:ring-2"
              style={inputStyle}
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border bg-white px-4 text-base outline-none focus:ring-2"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={handleForgotPassword}
              className="self-end text-sm font-medium hover:underline"
              style={{ color: "#A3206A" }}
            >
              Forgot Password?
            </button>
            <SubmitButton loading={loading} label="Sign In" />
          </form>
        )}
      </div>

      <Link to="/" className="mt-6 text-sm" style={{ color: "#9A8694" }}>
        ← Change language
      </Link>
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-full font-semibold text-white shadow-sm transition-transform hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
      style={{ backgroundColor: "#C2587A", height: "52px" }}
    >
      {loading ? "Please wait…" : label}
    </button>
  );
}
