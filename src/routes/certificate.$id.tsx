import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { X, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCertificate } from "@/lib/certificates.functions";
import { getLang, isRtl, t } from "@/lib/i18n";
import emblem from "@/assets/emblem.png";
import mark from "@/assets/mark.png";

export const Route = createFileRoute("/certificate/$id")({
  head: () => ({
    meta: [
      { title: "Certificate · Aurat Sahara" },
      { name: "description", content: "Aurat Sahara skill verification certificate." },
    ],
  }),
  component: CertificatePage,
});

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const RPL_LINK = "https://navttc.gov.pk/rpl";

const RPL_CONTENT = {
  en: {
    title: "Get Your Official Government Certificate!",
    intro:
      "RPL (Recognition of Prior Learning) is a FREE government program by NAVTTC Pakistan. It officially recognizes the skills you already have — even if you learned them at home, from family, or through years of practice — and gives you a nationally recognized certificate that is accepted across Pakistan and even abroad.",
    stepsTitle: "How to get it:",
    steps: [
      "Visit the NAVTTC RPL website",
      "Find your nearest assessment center",
      "Submit your documents",
      "Appear for a simple skills assessment",
      "Receive your official government verified certificate — completely FREE",
    ],
    button: "Visit NAVTTC RPL Website",
    reopen: "RPL Info",
  },
  ur: {
    title: "سرکاری سرٹیفکیٹ حاصل کریں!",
    intro:
      "RPL یعنی Recognition of Prior Learning — پاکستان کا NAVTTC کا مفت سرکاری پروگرام ہے۔ یہ آپ کی اُن مہارتوں کو سرکاری طور پر تسلیم کرتا ہے جو آپ نے گھر میں، خاندان سے، یا برسوں کی محنت سے سیکھی ہیں — اور آپ کو ایک قومی سرٹیفکیٹ دیتا ہے جو پورے پاکستان میں قابلِ قبول ہے۔",
    stepsTitle: "کیسے حاصل کریں:",
    steps: [
      "١. NAVTTC ویب سائٹ پر جائیں",
      "٢. قریبی مرکز تلاش کریں",
      "٣. دستاویزات جمع کروائیں",
      "٤. سادہ مہارت کا جائزہ دیں",
      "٥. مفت سرکاری سرٹیفکیٹ حاصل کریں",
    ],
    button: "NAVTTC ویب سائٹ پر جائیں",
    reopen: "RPL معلومات",
  },
  roman: {
    title: "Official Government Certificate Hasil Karein!",
    intro:
      "RPL yaani Recognition of Prior Learning — Pakistan ka NAVTTC ka bilkul FREE sarkari program hai. Yeh un skills ko officially pehchanta hai jo aap ne ghar mein, family se, ya barson ki mehnat se seekhi hain — aur aapko ek national certificate deta hai jo poore Pakistan mein qabool kiya jata hai.",
    stepsTitle: "Kaise hasil karein:",
    steps: [
      "1. NAVTTC RPL website par jayein",
      "2. Apna nazdeeqi center dhundein",
      "3. Documents jama karaein",
      "4. Simple skills assessment dein",
      "5. Bilkul FREE official certificate hasil karein",
    ],
    button: "NAVTTC RPL Website Kholein",
    reopen: "RPL Info",
  },
} as const;

function RplPopup({ lang, onClose }: { lang: "en" | "ur" | "roman"; onClose: () => void }) {
  const c = RPL_CONTENT[lang];
  const rtl = lang === "ur";
  const fontStyle = rtl ? { fontFamily: "var(--font-urdu)" } : undefined;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        dir={rtl ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        style={{ border: "1px solid rgba(139,34,82,0.15)" }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-[#8B2252]/10"
          style={{ color: "#8B2252" }}
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          className="pe-8 text-2xl font-bold leading-snug"
          style={{ color: "#8B2252", fontFamily: rtl ? "var(--font-urdu)" : "var(--font-display)" }}
        >
          {c.title}
        </h2>

        <p className="mt-4 text-sm leading-loose" style={{ color: "#5B4750", ...fontStyle }}>
          {c.intro}
        </p>

        <p className="mt-5 font-semibold" style={{ color: "#8B2252", ...fontStyle }}>
          {c.stepsTitle}
        </p>
        <ul className="mt-2 space-y-2 text-sm leading-relaxed" style={{ color: "#5B4750", ...fontStyle }}>
          {c.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>

        <a
          href={RPL_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 block w-full rounded-full px-6 py-3 text-center font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#8B2252", ...fontStyle }}
        >
          {c.button}
        </a>
      </div>
    </div>
  );
}

function CertificatePage() {
  const { id } = Route.useParams();
  const fetchCert = useServerFn(getCertificate);
  const lang = useMemo(getLang, []);
  const tr = t(lang);
  const rtl = isRtl(lang);
  const fontStyle = rtl ? { fontFamily: "var(--font-urdu)" } : undefined;

  const [rplOpen, setRplOpen] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setRplOpen(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const { data: cert, isLoading } = useQuery({
    queryKey: ["certificate", id],
    queryFn: () => fetchCert({ data: { id } }),
  });

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (isLoading) {
    return (
      <div className="aurat-page flex min-h-screen items-center justify-center">
        <p style={{ color: "#8B2252", ...fontStyle }}>{tr.loading}</p>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="aurat-page flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-lg" style={{ color: "#8B2252", ...fontStyle }}>{tr.certNotFound}</p>
        <Link to="/home" className="aurat-btn rounded-full px-6 py-2 font-semibold" style={fontStyle}>
          {tr.backToHome}
        </Link>
      </div>
    );
  }

  const verifyUrl = `${origin}/verify/${cert.uuid_verify}`;

  return (
    <div className="aurat-page min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Top bar: back + RPL */}
        <div className="no-print mb-4 flex items-center justify-between">
          <Link
            to="/home"
            className="flex items-center gap-1.5 rounded-full border bg-white/60 px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition hover:bg-white"
            style={{ color: "#8B2252", borderColor: "var(--aurat-line)", ...fontStyle }}
          >
            <ArrowLeft size={16} className={rtl ? "rotate-180" : ""} /> {tr.home}
          </Link>
          <button
            onClick={() => setRplOpen(true)}
            className="rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#8B2252", ...fontStyle }}
          >
            {RPL_CONTENT[lang].reopen}
          </button>
        </div>

        {rplOpen && <RplPopup lang={lang} onClose={() => setRplOpen(false)} />}

        {/* Certificate card */}
        <div
          className="cert-print relative mx-auto p-2.5 shadow-[0_30px_70px_-30px_rgba(139,34,82,0.45)]"
          style={{ backgroundColor: "#FAF5EE", border: "3px solid #C9A84C", borderRadius: "8px" }}
        >
          {/* Exit certificate */}
          <Link
            to="/home"
            aria-label="Exit certificate"
            className="no-print absolute -right-3 -top-3 z-10 grid h-9 w-9 place-items-center rounded-full text-white shadow-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#8B2252" }}
          >
            <X className="h-5 w-5" />
          </Link>
          <div
            className="relative overflow-hidden px-8 py-12 text-center"
            style={{ border: "1.5px solid #C2587A", borderRadius: "5px" }}
          >
            {/* Emblem watermark */}
            <img
              src={emblem}
              alt=""
              width={1024}
              height={1024}
              className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.06]"
            />

            <div className="relative">
              <img
                src={mark}
                alt="Aurat Sahara"
                width={1024}
                height={1024}
                className="mx-auto h-16 w-16 object-contain"
              />
              <h1
                className="mt-2 text-5xl font-bold"
                style={{ color: "#8B2252", fontFamily: "var(--font-display)" }}
              >
                Aurat Sahara
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.25em]" style={{ color: "#A3206A", ...fontStyle }}>
                {tr.certSubtitle}
              </p>

              <div className="mx-auto my-8 flex items-center justify-center gap-3">
                <span className="h-px w-16" style={{ backgroundColor: "#C9A84C" }} />
                <span className="text-[#C9A84C]">✦</span>
                <span className="h-px w-16" style={{ backgroundColor: "#C9A84C" }} />
              </div>

              <p
                dir={rtl ? "rtl" : "ltr"}
                className="mx-auto max-w-md text-lg leading-loose"
                style={{ color: "#5B4750", ...fontStyle }}
              >
                {tr.certBodyPrefix}{" "}
                <bdi className="font-semibold" style={{ color: "#8B2252" }}>
                  {cert.full_name || "—"}
                  {cert.full_name_ur && (
                    <bdi style={{ fontFamily: "var(--font-urdu)" }}>
                      {" "}({cert.full_name_ur})
                    </bdi>
                  )}
                </bdi>{" "}
                {tr.certBodyMiddle}{" "}
                <bdi className="font-semibold" style={{ color: "#8B2252" }}>
                  {cert.skill || "—"}
                  {cert.skill_ur && (
                    <bdi style={{ fontFamily: "var(--font-urdu)" }}>
                      {" "}({cert.skill_ur})
                    </bdi>
                  )}
                </bdi>
                {rtl ? "۔" : "."}
              </p>

              <p
                dir={rtl ? "rtl" : "ltr"}
                className="mt-8 text-sm"
                style={{ color: "#7A6470", ...fontStyle }}
              >
                {tr.issuedOn}{" "}
                <bdi>{formatDate(cert.issue_date)}</bdi>
              </p>

              {/* Seal */}
              <div
                className="mx-auto mt-6 grid h-16 w-16 place-items-center rounded-full text-[10px] font-semibold uppercase leading-tight tracking-wide text-white"
                style={{ backgroundImage: "var(--aurat-grad)", boxShadow: "0 0 0 3px rgba(201,168,76,0.4)" }}
              >
                ✦<br />Verified
              </div>

              <div className="mt-8 text-xs" style={{ color: "#9A7E8C" }}>
                <p dir={rtl ? "rtl" : "ltr"} style={fontStyle}>{tr.verifyAt}</p>
                <a
                  href={verifyUrl}
                  className="break-all underline"
                  style={{ color: "#A3206A" }}
                >
                  {verifyUrl}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="no-print mt-8 flex justify-center">
          <button
            onClick={() => window.print()}
            className="aurat-btn rounded-full px-8 py-3 font-semibold"
            style={fontStyle}
          >
            {tr.downloadCertificate}
          </button>
        </div>
      </div>
    </div>
  );
}

