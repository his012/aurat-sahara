import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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
          onClick={() => navigate({ to: "/apply" })}
          className="aurat-btn flex w-full items-center justify-center gap-2 rounded-full px-8 text-lg font-semibold"
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
    </div>
  );
}
