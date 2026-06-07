import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Send, Mic, Paperclip, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { grokChat } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/apply")({
  head: () => ({
    meta: [
      { title: "Apply · Aurat Sahara" },
      { name: "description", content: "Chat with Aurat Sahara AI to apply for your skill certificate." },
    ],
  }),
  component: Apply,
});

type ChatMsg = { role: "user" | "assistant"; content: string; thumbs?: string[] };

const STATUS_COLORS: Record<string, string> = {
  pending: "#F5A623",
  approved: "#27AE60",
  declined: "#E74C3C",
};

const GREETING: Record<string, string> = {
  ur: "سلام! میں عورت سہارا AI ہوں۔ آپ کس کام کا سرٹیفکیٹ لینا چاہتی ہیں؟",
  roman: "Salam! Main Aurat Sahara AI hun. Aap kis kaam ka certificate lena chahti hain?",
  en: "Salam! I am Aurat Sahara AI. What skill would you like a certificate for?",
};

function getLang(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("selectedLang") || "en";
}

function Apply() {
  const navigate = useNavigate();
  const lang = useMemo(getLang, []);
  const callGrok = useServerFn(grokChat);

  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: GREETING[lang] ?? GREETING.en },
  ]);
  const [input, setInput] = useState("");
  const [pendingUploads, setPendingUploads] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [listening, setListening] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const { data: apps = [], refetch } = useQuery({
    queryKey: ["my-applications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificate_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data;
    },
  });

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setPendingUploads((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeUpload = (idx: number) => {
    setPendingUploads((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const startListening = () => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new SR();
    recognition.lang = lang === "ur" ? "ur-PK" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " : "") + transcript);
    };
    recognition.onerror = () => {
      toast.error("Could not capture voice. Please try again.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const send = async () => {
    if (sending || submitted) return;
    const text = input.trim();
    if (!text && pendingUploads.length === 0) return;
    if (!userId) {
      toast.error("Please sign in again.");
      return;
    }

    setSending(true);
    const sentPreviews = [...previews];
    const filesToUpload = [...pendingUploads];

    // Optimistically render the user message.
    const userMsg: ChatMsg = { role: "user", content: text, thumbs: sentPreviews };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setPendingUploads([]);
    setPreviews([]);

    try {
      // Upload images to storage and collect their paths.
      const imagePaths: string[] = [];
      for (const f of filesToUpload) {
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${f.name}`;
        const { error } = await supabase.storage.from("work-proofs").upload(path, f);
        if (!error) imagePaths.push(path);
      }

      const history = nextMessages.map((m) => ({ role: m.role, content: m.content }));
      const res = await callGrok({
        data: { messages: history, image_paths: imagePaths, lang },
      });

      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      if (res.applicationSubmitted) {
        setSubmitted(true);
        refetch();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 md:px-8" style={{ backgroundColor: "#FAF5EE" }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row">
        {/* Left: Meri Applications */}
        <aside className="w-full md:w-[30%]">
          <div className="rounded-2xl border bg-white/70 p-4" style={{ borderColor: "#F0C9DD" }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: "#8B2252" }}>
                Meri Applications
              </h2>
              <span
                className="rounded-full px-2.5 py-0.5 text-sm font-semibold text-white"
                style={{ backgroundColor: "#C2587A" }}
              >
                {apps.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {apps.length === 0 && (
                <p className="text-sm" style={{ color: "#9B8794" }}>
                  Abhi koi application nahi. Niche chat se shuru karein.
                </p>
              )}
              {apps.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border p-3"
                  style={{ borderColor: "#EEDDE6" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium" style={{ color: "#5A4650" }}>
                      {a.skill || "—"}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: STATUS_COLORS[a.status] ?? "#999" }}
                    >
                      {a.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs" style={{ color: "#9B8794" }}>
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right: Chat */}
        <main className="flex w-full flex-col md:w-[70%]">
          <div
            className="flex h-[70vh] flex-col rounded-2xl border bg-white/70"
            style={{ borderColor: "#F0C9DD" }}
          >
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div
                      className="h-8 w-8 shrink-0 rounded-full"
                      style={{ backgroundColor: "#C2587A" }}
                    />
                  )}
                  <div
                    className="max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed"
                    style={
                      m.role === "user"
                        ? { backgroundColor: "#C2587A", color: "#fff" }
                        : { backgroundColor: "#F6E8F0", color: "#4A3942" }
                    }
                  >
                    {m.thumbs && m.thumbs.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {m.thumbs.map((t, ti) => (
                          <img
                            key={ti}
                            src={t}
                            alt="upload"
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                    {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 shrink-0 rounded-full" style={{ backgroundColor: "#C2587A" }} />
                  <div className="rounded-2xl px-4 py-2 text-sm" style={{ backgroundColor: "#F6E8F0", color: "#9B8794" }}>
                    typing…
                  </div>
                </div>
              )}
            </div>

            {submitted && (
              <div
                className="mx-4 mb-2 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
                style={{ backgroundColor: "#E5F6EC", color: "#1E7E45" }}
              >
                <CheckCircle2 size={18} />
                Application submitted successfully! We'll notify you after review.
              </div>
            )}

            {/* Composer */}
            <div className="border-t p-3" style={{ borderColor: "#F0C9DD" }}>
              {previews.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {previews.map((p, i) => (
                    <div key={i} className="relative">
                      <img src={p} alt="preview" className="h-16 w-16 rounded-lg object-cover" />
                      <button
                        onClick={() => removeUpload(i)}
                        className="absolute -right-1.5 -top-1.5 rounded-full bg-black/60 p-0.5 text-white"
                        aria-label="Remove"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleFiles}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={submitted}
                  aria-label="Attach image"
                  className="rounded-full p-2 text-[#8B2252] hover:bg-[#F6E8F0] disabled:opacity-40"
                >
                  <Paperclip size={20} />
                </button>
                <button
                  onClick={startListening}
                  disabled={submitted}
                  aria-label="Voice input"
                  className="rounded-full p-2 hover:bg-[#F6E8F0] disabled:opacity-40"
                  style={{ color: listening ? "#E74C3C" : "#8B2252" }}
                >
                  <Mic size={20} />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                  disabled={submitted}
                  placeholder={submitted ? "Application submitted" : "Type your message…"}
                  className="flex-1 rounded-full border px-4 py-2.5 text-sm outline-none disabled:opacity-50"
                  style={{ borderColor: "#D4A0B8" }}
                />
                <button
                  onClick={send}
                  disabled={sending || submitted}
                  aria-label="Send"
                  className="rounded-full p-2.5 text-white disabled:opacity-40"
                  style={{ backgroundColor: "#C2587A" }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate({ to: "/home" })}
            className="mt-4 self-start text-sm font-medium"
            style={{ color: "#8B2252" }}
          >
            ← Back to Home
          </button>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
