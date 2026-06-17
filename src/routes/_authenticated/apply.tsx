import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Send, Mic, Paperclip, X, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { grokChat } from "@/lib/chat.functions";
import { getLang, isRtl, t } from "@/lib/i18n";
import mark from "@/assets/mark.png";

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

const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  pending: { bg: "#FDF1DE", color: "#B9791A", dot: "#F5A623" },
  approved: { bg: "#E5F6EC", color: "#1E7E45", dot: "#27AE60" },
  declined: { bg: "#FBE7E5", color: "#C0392B", dot: "#E74C3C" },
};

const GREETING: Record<string, string> = {
  ur: "سلام! میں عورت سہارا AI ہوں۔ آپ کس کام کا سرٹیفکیٹ لینا چاہتی ہیں؟",
  roman: "Salam! Main Aurat Sahara AI hun. Aap kis kaam ka certificate lena chahti hain?",
  en: "Salam! I am Aurat Sahara AI. What skill would you like a certificate for?",
};

const CNIC_LABELS: Record<string, { front: string; back: string; heading: string }> = {
  ur: { front: "CNIC سامنے", back: "CNIC پیچھے", heading: "اپنا شناختی کارڈ اپلوڈ کریں" },
  roman: { front: "CNIC Front", back: "CNIC Back", heading: "Apna CNIC upload karein" },
  en: { front: "CNIC Front", back: "CNIC Back", heading: "Upload your CNIC" },
};

function Apply() {
  const navigate = useNavigate();
  const lang = useMemo(getLang, []);
  const tr = t(lang);
  const rtl = isRtl(lang);
  const fontStyle = rtl ? { fontFamily: "var(--font-urdu)" } : undefined;
  const callGrok = useServerFn(grokChat);

  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: GREETING[lang] ?? GREETING.en },
  ]);
  const [input, setInput] = useState("");
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [cnicFront, setCnicFront] = useState<{ path: string; preview: string } | null>(null);
  const [cnicBack, setCnicBack] = useState<{ path: string; preview: string } | null>(null);
  const [cnicUploading, setCnicUploading] = useState<"front" | "back" | null>(null);
  const [cnicRequested, setCnicRequested] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [listening, setListening] = useState(false);
  const [micAvailable, setMicAvailable] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const cnicFrontRef = useRef<HTMLInputElement>(null);
  const cnicBackRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) &&
      !!navigator.mediaDevices?.getUserMedia;
    setMicAvailable(supported);
  }, []);

  // When both CNIC images are uploaded, send a one-time acknowledgment so the
  // AI knows and stops re-asking for them.
  useEffect(() => {
    if (!bothCnicUploaded || cnicAckSentRef.current || sending || submitted) return;
    cnicAckSentRef.current = true;
    void (async () => {
      const ackText = CNIC_ACK[lang] ?? CNIC_ACK.en;
      const userMsg: ChatMsg = { role: "user", content: ackText };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setSending(true);
      try {
        const history = nextMessages.map((m) => ({ role: m.role, content: m.content }));
        const res = await callGrok({
          data: { messages: history, image_urls: uploadedImageUrls, cnic_image_urls: cnicImageUrls, lang },
        });
        setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      } catch {
        setMessages((prev) => [...prev, { role: "assistant", content: tr.somethingWrong }]);
      } finally {
        setSending(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bothCnicUploaded]);

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

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (fileRef.current) fileRef.current.value = "";
    if (files.length === 0) return;
    if (!userId) {
      toast.error(tr.signInAgain);
      return;
    }

    setUploading(true);
    try {
      for (const f of files) {
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${f.name}`;
        const { error } = await supabase.storage
          .from("portfolio-images")
          .upload(path, f);
        if (error) {
          toast.error(tr.uploadFailed);
          continue;
        }
        setUploadedImageUrls((prev) => [...prev, path]);
        setPreviews((prev) => [...prev, URL.createObjectURL(f)]);
      }
    } finally {
      setUploading(false);
    }
  };

  const removeUpload = (idx: number) => {
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadCnic = async (side: "front" | "back", file: File) => {
    if (!userId) {
      toast.error(tr.signInAgain);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG or PNG) only.");
      return;
    }
    setCnicUploading(side);
    try {
      const path = `${userId}/cnic-${side}-${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
      const { error } = await supabase.storage.from("portfolio-images").upload(path, file);
      if (error) {
        toast.error(tr.uploadFailed);
        return;
      }
      const entry = { path, preview: URL.createObjectURL(file) };
      if (side === "front") setCnicFront(entry);
      else setCnicBack(entry);
    } finally {
      setCnicUploading(null);
    }
  };

  const startListening = async () => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setMicAvailable(false);
      return;
    }

    // Request microphone permission first (must stay within the click gesture).
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // We only needed the permission; release the tracks right away.
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      // Permission denied or unavailable: hide the button silently.
      setMicAvailable(false);
      setListening(false);
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " : "") + transcript);
    };
    recognition.onerror = (event: any) => {
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
        setMicAvailable(false);
      }
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };


  const isComplete = (c: any) =>
    !!c &&
    c.skill != null &&
    c.full_name != null &&
    c.age != null &&
    c.education != null &&
    c.experience != null &&
    c.cnic_number != null;

  const cnicImageUrls = useMemo(
    () => [cnicFront?.path, cnicBack?.path].filter(Boolean) as string[],
    [cnicFront, cnicBack],
  );
  const bothCnicUploaded = !!cnicFront && !!cnicBack;
  const cnicAckSentRef = useRef(false);

  const CNIC_ACK: Record<string, string> = {
    ur: "میں نے اپنے شناختی کارڈ کی دونوں تصاویر (سامنے اور پیچھے) اپلوڈ کر دی ہیں۔",
    roman: "Maine apne CNIC ki dono tasveerein (front aur back) upload kar di hain.",
    en: "I have uploaded both sides of my CNIC (front and back).",
  };

  const finalizeSubmission = async (history: ChatMsg[]) => {
    const res = await callGrok({
      data: {
        messages: history.map((m) => ({ role: m.role, content: m.content })),
        image_urls: uploadedImageUrls,
        cnic_image_urls: cnicImageUrls,
        forceSubmit: true,
        lang,
      },
    });
    setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    if (res.applicationSubmitted) {
      setSubmitted(true);
      refetch();
    }
  };

  const send = async () => {
    if (sending || submitted || uploading) return;
    const text = input.trim();
    if (!text && uploadedImageUrls.length === 0) return;
    if (!userId) {
      toast.error(tr.signInAgain);
      return;
    }

    setSending(true);
    const sentPreviews = [...previews];

    const userMsg: ChatMsg = { role: "user", content: text, thumbs: sentPreviews };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");

    try {
      const history = nextMessages.map((m) => ({ role: m.role, content: m.content }));
      const res = await callGrok({
        data: { messages: history, image_urls: uploadedImageUrls, cnic_image_urls: cnicImageUrls, lang },
      });

      const replyMsg: ChatMsg = { role: "assistant", content: res.reply };
      setMessages((prev) => [...prev, replyMsg]);

      if (res.collected?.cnic_number) setCnicRequested(true);

      if (res.applicationSubmitted) {
        setSubmitted(true);
        refetch();
        return;
      }

      if (
        uploadedImageUrls.length >= 3 &&
        bothCnicUploaded &&
        isComplete(res.collected)
      ) {
        await finalizeSubmission([...nextMessages, replyMsg]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: tr.somethingWrong },
      ]);
    } finally {
      setSending(false);
    }
  };

  const Avatar = () => (
    <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-[#F0C9DD] bg-white shadow-sm">
      <img src={mark} alt="AI" width={1024} height={1024} className="h-7 w-7 object-contain" />
    </div>
  );

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="aurat-page relative min-h-screen overflow-hidden px-4 py-6 md:px-8"
    >
      <div className="pointer-events-none absolute -right-24 -top-10 h-72 w-72 rounded-full bg-[#e08ca8]/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="flex items-center gap-1.5 rounded-full border bg-white/60 px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition hover:bg-white"
            style={{ color: "#8B2252", borderColor: "var(--aurat-line)", ...fontStyle }}
          >
            <ArrowLeft size={16} className={rtl ? "rotate-180" : ""} /> {tr.backToHome}
          </button>
          <div className="flex items-center gap-2">
            <img src={mark} alt="" width={1024} height={1024} className="h-8 w-8 object-contain" />
            <span className="aurat-display text-xl font-bold" style={{ color: "#8B2252" }}>
              Aurat Sahara
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Left: My Applications */}
          <aside className="w-full md:w-[30%]">
            <div className="aurat-card rounded-3xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: "#8B2252", ...fontStyle }}>
                  {tr.myApplications}
                </h2>
                <span
                  className="grid h-7 min-w-7 place-items-center rounded-full px-2 text-sm font-semibold text-white"
                  style={{ backgroundImage: "var(--aurat-grad)" }}
                >
                  {apps.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {apps.length === 0 && (
                  <p className="text-sm" style={{ color: "var(--aurat-muted)", ...fontStyle }}>
                    {tr.noApplications}
                  </p>
                )}
                {apps.map((a) => {
                  const s = STATUS_STYLES[a.status] ?? STATUS_STYLES.pending;
                  return (
                    <div
                      key={a.id}
                      className="rounded-2xl border bg-white/70 p-3.5 transition hover:shadow-[0_14px_30px_-22px_rgba(139,34,82,0.5)]"
                      style={{ borderColor: "#EEDDE6" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium" style={{ color: "var(--aurat-ink)" }}>
                          {a.skill || "—"}
                        </span>
                        <span
                          className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                          style={{ backgroundColor: s.bg, color: s.color }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                          {a.status}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs" style={{ color: "var(--aurat-muted)" }}>
                        {new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right: Chat */}
          <main className="flex w-full flex-col md:w-[70%]">
            <div className="aurat-card flex h-[72vh] flex-col rounded-3xl">
              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && <Avatar />}
                    <div
                      className="max-w-[75%] px-4 py-2.5 text-sm leading-relaxed shadow-sm"
                      style={
                        m.role === "user"
                          ? {
                              backgroundImage: "var(--aurat-grad)",
                              color: "#fff",
                              borderRadius: "18px 18px 4px 18px",
                            }
                          : {
                              backgroundColor: "#FBEFF5",
                              color: "var(--aurat-ink)",
                              borderRadius: "18px 18px 18px 4px",
                            }
                      }
                    >
                      {m.thumbs && m.thumbs.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {m.thumbs.map((th, ti) => (
                            <img
                              key={ti}
                              src={th}
                              alt="upload"
                              className="h-16 w-16 rounded-xl object-cover"
                            />
                          ))}
                        </div>
                      )}
                      {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex items-end gap-2">
                    <Avatar />
                    <div
                      className="flex items-center gap-1.5 px-4 py-3"
                      style={{ backgroundColor: "#FBEFF5", borderRadius: "18px 18px 18px 4px" }}
                    >
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#C2587A] [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#C2587A] [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#C2587A]" />
                    </div>
                  </div>
                )}
              </div>

              {submitted && (
                <div
                  className="mx-4 mb-2 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium"
                  style={{ backgroundColor: "#E5F6EC", color: "#1E7E45", ...fontStyle }}
                >
                  <CheckCircle2 size={18} />
                  {tr.submittedSuccess}
                </div>
              )}

              {cnicRequested && !submitted && (!cnicFront || !cnicBack) && (
                <div
                  className="mx-4 mb-2 rounded-2xl border p-4"
                  style={{ borderColor: "#F0C9DD", backgroundColor: "#FFF7FB" }}
                >
                  <p className="mb-3 text-sm font-semibold" style={{ color: "#8B2252", ...fontStyle }}>
                    {(CNIC_LABELS[lang] ?? CNIC_LABELS.en).heading}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {(["front", "back"] as const).map((side) => {
                      const slot = side === "front" ? cnicFront : cnicBack;
                      const ref = side === "front" ? cnicFrontRef : cnicBackRef;
                      const label = (CNIC_LABELS[lang] ?? CNIC_LABELS.en)[side];
                      return (
                        <div key={side}>
                          <input
                            ref={ref}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (ref.current) ref.current.value = "";
                              if (f) uploadCnic(side, f);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => ref.current?.click()}
                            disabled={cnicUploading === side}
                            className="flex h-28 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-white text-xs font-medium transition hover:bg-[#FBEFF5] disabled:opacity-50"
                            style={{ borderColor: slot ? "#27AE60" : "#D4A0B8", color: "#8B2252", ...fontStyle }}
                          >
                            {slot ? (
                              <img src={slot.preview} alt={label} className="h-full w-full object-cover" />
                            ) : (
                              <>
                                <Paperclip size={20} />
                                <span className="mt-1">{label}</span>
                                {cnicUploading === side && <span className="text-[10px]">{tr.uploading}</span>}
                              </>
                            )}
                          </button>
                          {slot && (
                            <button
                              type="button"
                              onClick={() => (side === "front" ? setCnicFront(null) : setCnicBack(null))}
                              className="mt-1 text-[11px] underline"
                              style={{ color: "#C0392B" }}
                            >
                              ✕ {label}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Composer */}
              <div className="border-t p-3" style={{ borderColor: "var(--aurat-line)" }}>
                {previews.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {previews.map((p, i) => (
                      <div key={i} className="relative">
                        <img src={p} alt="preview" className="h-16 w-16 rounded-xl object-cover" />
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
                <div className="flex items-center gap-2 rounded-full border bg-white/80 px-2 py-1.5" style={{ borderColor: "#E0BFD0" }}>
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
                    disabled={submitted || uploading}
                    aria-label="Attach image"
                    className="flex items-center gap-1 rounded-full px-2 py-2 text-[#8B2252] hover:bg-[#F6E8F0] disabled:opacity-40"
                  >
                    <Paperclip size={20} />
                    {uploading ? (
                      <span className="text-xs font-medium" style={fontStyle}>{tr.uploading}</span>
                    ) : (
                      uploadedImageUrls.length > 0 && (
                        <span className="text-xs font-medium" style={fontStyle}>
                          📎 {uploadedImageUrls.length} {tr.uploadedSuffix}
                        </span>
                      )
                    )}
                  </button>
                  {micAvailable && (
                    <button
                      onClick={startListening}
                      disabled={submitted}
                      aria-label="Voice input"
                      className="rounded-full p-2 hover:bg-[#F6E8F0] disabled:opacity-40"
                      style={{ color: listening ? "#E74C3C" : "#8B2252" }}
                    >
                      <Mic size={20} />
                    </button>
                  )}
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                    disabled={submitted}
                    placeholder={submitted ? tr.applicationSubmitted : tr.typeMessage}
                    className="flex-1 bg-transparent px-2 py-2 text-sm outline-none disabled:opacity-50"
                    style={fontStyle}
                  />
                  <button
                    onClick={send}
                    disabled={sending || submitted || uploading}
                    aria-label="Send"
                    className="aurat-btn grid h-10 w-10 shrink-0 place-items-center rounded-full"
                  >
                    <Send size={18} className={rtl ? "rotate-180" : ""} />
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
