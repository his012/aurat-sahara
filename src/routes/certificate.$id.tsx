import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCertificate } from "@/lib/certificates.functions";
import { getLang, isRtl, t } from "@/lib/i18n";

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

function CertificatePage() {
  const { id } = Route.useParams();
  const fetchCert = useServerFn(getCertificate);
  const lang = useMemo(getLang, []);
  const tr = t(lang);
  const rtl = isRtl(lang);
  const fontStyle = rtl ? { fontFamily: "var(--font-urdu)" } : undefined;

  const { data: cert, isLoading } = useQuery({
    queryKey: ["certificate", id],
    queryFn: () => fetchCert({ data: { id } }),
  });

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#FAF5EE" }}>
        <p style={{ color: "#8B2252", ...fontStyle }}>{tr.loading}</p>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6" style={{ backgroundColor: "#FAF5EE" }}>
        <p className="text-lg" style={{ color: "#8B2252", ...fontStyle }}>{tr.certNotFound}</p>
        <Link to="/home" className="rounded-full px-6 py-2 font-semibold text-white" style={{ backgroundColor: "#C2587A", ...fontStyle }}>
          {tr.backToHome}
        </Link>
      </div>
    );
  }

  const verifyUrl = `${origin}/verify/${cert.uuid_verify}`;

  return (
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: "#FAF5EE" }}>
      <div className="mx-auto max-w-2xl">
        {/* Certificate card */}
        <div
          className="cert-print relative mx-auto bg-[#FAF5EE] p-2"
          style={{ border: "3px solid #C2587A", borderRadius: "6px" }}
        >
          <div
            className="px-8 py-12 text-center"
            style={{ border: "1px solid #D4A0B8", borderRadius: "4px" }}
          >
            <h1
              className="text-5xl font-bold"
              style={{ color: "#8B2252", fontFamily: "var(--font-display)" }}
            >
              Aurat Sahara
            </h1>
            <p className="mt-2 text-sm uppercase tracking-[0.25em]" style={{ color: "#A3206A" }}>
              Certificate of Skill Verification
            </p>

            <div className="mx-auto my-8 h-px w-24" style={{ backgroundColor: "#D4A0B8" }} />

            <p className="mx-auto max-w-md text-lg leading-relaxed" style={{ color: "#5B4750" }}>
              This certifies that{" "}
              <span className="font-semibold" style={{ color: "#8B2252" }}>
                {cert.full_name || "—"}
              </span>{" "}
              has demonstrated verified proficiency in{" "}
              <span className="font-semibold" style={{ color: "#8B2252" }}>
                {cert.skill || "—"}
              </span>
              .
            </p>

            <p className="mt-8 text-sm" style={{ color: "#7A6470" }}>
              Issued on {formatDate(cert.issue_date)}
            </p>

            <div className="mt-10 text-xs" style={{ color: "#9A7E8C" }}>
              <p>Verify this certificate at:</p>
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

        {/* Actions */}
        <div className="no-print mt-8 flex justify-center">
          <button
            onClick={() => window.print()}
            className="rounded-full px-8 py-3 font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#C2587A" }}
          >
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
