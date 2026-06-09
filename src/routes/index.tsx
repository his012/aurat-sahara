import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { setLang, type Lang } from "@/lib/i18n";
import emblem from "@/assets/emblem.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurat Sahara | عورت سہارا" },
      {
        name: "description",
        content:
          "Aurat Sahara — choose your language to get started. English, اردو, or Roman Urdu.",
      },
      { property: "og:title", content: "Aurat Sahara | عورت سہارا" },
      {
        property: "og:description",
        content: "Choose your language to get started with Aurat Sahara.",
      },
    ],
  }),
  component: LanguageSelect,
});

type LangOption = {
  value: "en" | "ur" | "roman";
  label: string;
  hint: string;
  urdu?: boolean;
};

const OPTIONS: LangOption[] = [
  { value: "en", label: "English", hint: "Continue in English" },
  { value: "ur", label: "اردو", hint: "اردو میں جاری رکھیں", urdu: true },
  { value: "roman", label: "Roman Urdu", hint: "Roman Urdu mein jari rakhein" },
];

function LanguageSelect() {
  const navigate = useNavigate();

  const choose = (value: LangOption["value"]) => {
    setLang(value as Lang);
    navigate({ to: "/auth" });
  };

  return (
    <div className="aurat-page relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#e08ca8]/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#c9a84c]/15 blur-3xl" />

      <div className="aurat-rise flex flex-col items-center text-center">
        <img
          src={emblem}
          alt="Aurat Sahara emblem"
          width={1024}
          height={1024}
          className="aurat-float h-44 w-44 object-contain drop-shadow-[0_18px_30px_rgba(139,34,82,0.18)]"
        />

        <div className="mx-auto mt-6 h-px w-40 aurat-divider" />

        <div className="mt-6 flex flex-col items-center gap-1.5">
          <p className="text-base font-medium" style={{ color: "var(--aurat-ink)" }}>
            Which language would you like?
          </p>
          <p
            className="text-base"
            style={{ color: "var(--aurat-rose)", fontFamily: "var(--font-urdu)" }}
            dir="rtl"
          >
            آپ کون سی زبان چاہتے ہیں؟
          </p>
          <p className="text-sm italic" style={{ color: "var(--aurat-muted)" }}>
            Aap kaunsi zabaan chunna chahenge?
          </p>
        </div>
      </div>

      <div className="mt-10 flex w-full max-w-xs flex-col items-stretch gap-3">
        {OPTIONS.map((opt, i) => (
          <button
            key={opt.value}
            onClick={() => choose(opt.value)}
            className="aurat-rise group flex items-center justify-between rounded-2xl border bg-white/70 px-5 py-4 text-left backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-transparent hover:bg-white hover:shadow-[0_20px_40px_-22px_rgba(139,34,82,0.5)]"
            style={{ borderColor: "var(--aurat-line)", animationDelay: `${0.1 + i * 0.08}s` }}
          >
            <span className="flex flex-col">
              <span
                className="font-semibold"
                style={{
                  color: "var(--aurat-plum)",
                  fontFamily: opt.urdu ? "var(--font-urdu)" : undefined,
                  fontSize: opt.urdu ? "20px" : "17px",
                }}
              >
                {opt.label}
              </span>
              <span
                className="text-xs"
                style={{
                  color: "var(--aurat-muted)",
                  fontFamily: opt.urdu ? "var(--font-urdu)" : undefined,
                }}
                dir={opt.urdu ? "rtl" : "ltr"}
              >
                {opt.hint}
              </span>
            </span>
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white transition-transform group-hover:translate-x-0.5"
              style={{ backgroundImage: "var(--aurat-grad)" }}
            >
              →
            </span>
          </button>
        ))}
      </div>

      <p className="mt-10 text-xs tracking-wide" style={{ color: "var(--aurat-muted)" }}>
        Empowered women, empower women
      </p>
    </div>
  );
}
