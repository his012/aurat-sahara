import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { setLang, type Lang } from "@/lib/i18n";

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
  color: string;
  urdu?: boolean;
};

const OPTIONS: LangOption[] = [
  { value: "en", label: "English", color: "#C2587A" },
  { value: "ur", label: "اردو", color: "#7B4F9E", urdu: true },
  { value: "roman", label: "Roman Urdu", color: "#A3206A" },
];

function LanguageSelect() {
  const navigate = useNavigate();

  const choose = (value: LangOption["value"]) => {
    try {
      localStorage.setItem("selectedLang", value);
    } catch {
      /* ignore storage errors */
    }
    navigate({ to: "/auth" });
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: "#FAF5EE" }}
    >
      <h1
        className="text-center text-3xl font-bold sm:text-4xl"
        style={{ color: "#8B2252", fontFamily: 'var(--font-display)' }}
      >
        Aurat Sahara | عورت سہارا
      </h1>

      <div className="mt-8 flex flex-col items-center gap-1 text-center">
        <p className="text-base" style={{ color: "#6B5563" }}>
          Which language would you like?
        </p>
        <p
          className="text-base"
          style={{ color: "#8A7686", fontFamily: 'var(--font-urdu)' }}
          dir="rtl"
        >
          آپ کون سی زبان چاہتے ہیں؟
        </p>
        <p className="text-base italic" style={{ color: "#A493A0" }}>
          Aap kaunsi zabaan chunna chahenge?
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => choose(opt.value)}
            className="rounded-full font-medium text-white shadow-sm transition-transform hover:brightness-105 active:scale-[0.98]"
            style={{
              backgroundColor: opt.color,
              height: "52px",
              width: "280px",
              fontFamily: opt.urdu ? 'var(--font-urdu)' : undefined,
              fontSize: opt.urdu ? "18px" : "16px",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
