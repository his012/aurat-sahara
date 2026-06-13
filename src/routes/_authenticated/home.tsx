import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { getLang, isRtl, t } from "@/lib/i18n";
import { getPrivacyTerms } from "@/lib/privacy-terms";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const rtl = isRtl(lang);
  const fontStyle = rtl ? { fontFamily: "var(--font-urdu)" } : undefined;
  const terms = getPrivacyTerms(lang);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAgree = () => {
    setIsModalOpen(false);
    navigate({ to: "/apply" });
  };

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="home-page relative flex min-h-screen flex-col overflow-hidden"
    >
      <section className="home-brand-section relative z-10 flex w-full justify-center px-6 py-5">
        <div className="flex w-full max-w-3xl items-center justify-center gap-5 text-center sm:gap-8">
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

        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-8 text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="aurat-btn flex w-full items-center justify-center gap-2 rounded-full px-8 text-lg font-semibold"
            style={{ height: "58px", ...fontStyle }}
          >
            {terms.startBtn ?? (lang === "ur" ? "شروع کریں" : lang === "roman" ? "Shuru Karein" : "Get Started")}
            <ArrowRight size={20} className={rtl ? "rotate-180" : ""} />
          </button>
        </div>

        <p className="relative z-10 mt-auto text-center text-xs text-primary-foreground/80">
          Maham Lodhi &amp; Farhan Shoukat
        </p>
      </section>

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        // Prevent closing by outside click / Escape — only buttons control state
        if (!open) return;
        setIsModalOpen(open);
      }}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className="fixed left-[50%] top-[50%] z-50 w-[92vw] max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            <div className="flex flex-col max-h-[80vh]">
              <div className="shrink-0 px-6 pt-6 pb-3">
                <DialogTitle
                  className="text-xl font-bold"
                  style={{ color: "#4a0e2a" }}
                >
                  {terms.title}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  {terms.intro}
                </DialogDescription>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-3">
                <h3 className="mt-3 text-sm font-bold uppercase tracking-wide" style={{ color: "#4a0e2a" }}>
                  {terms.privacyLabel}
                </h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-foreground/80">
                  {terms.privacyPoints.map((point, i) => (
                    <li key={`p-${i}`}>{point}</li>
                  ))}
                </ul>

                <h3 className="mt-5 text-sm font-bold uppercase tracking-wide" style={{ color: "#4a0e2a" }}>
                  {terms.termsLabel}
                </h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-foreground/80">
                  {terms.termsPoints.map((point, i) => (
                    <li key={`t-${i}`}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="shrink-0 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-gray-100 px-6 py-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                  style={{ borderColor: "#4a0e2a", color: "#4a0e2a", backgroundColor: "transparent" }}
                >
                  {terms.declineBtn}
                </button>
                <button
                  onClick={handleAgree}
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: "#4a0e2a" }}
                >
                  {terms.agreeContinueBtn}
                </button>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
