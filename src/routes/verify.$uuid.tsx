import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyCertificate } from "@/lib/certificates.functions";
import { getLang, isRtl, t } from "@/lib/i18n";

export const Route = createFileRoute("/verify/$uuid")({
  head: () => ({
    meta: [
      { title: "Verify Certificate · Aurat Sahara" },
      { name: "description", content: "Verify the authenticity of an Aurat Sahara certificate." },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { uuid } = Route.useParams();
  const doVerify = useServerFn(verifyCertificate);
  const lang = useMemo(getLang, []);
  const tr = t(lang);
  const rtl = isRtl(lang);
  const fontStyle = rtl ? { fontFamily: "var(--font-urdu)" } : undefined;


  const { data, isLoading } = useQuery({
    queryKey: ["verify", uuid],
    queryFn: () => doVerify({ data: { uuid } }),
  });

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ backgroundColor: "#FAF5EE" }}
    >
      <div className="w-full max-w-md">
        <h1
          className="mb-8 text-center text-4xl font-bold"
          style={{ color: "#8B2252", fontFamily: "var(--font-display)" }}
        >
          Aurat Sahara
        </h1>

        {isLoading ? (
          <p className="text-center" style={{ color: "#8B2252" }}>Verifying…</p>
        ) : data?.valid ? (
          <div
            className="rounded-2xl border-2 p-8 text-center"
            style={{ borderColor: "#27AE60", backgroundColor: "#EAF7EF" }}
          >
            <CheckCircle2 className="mx-auto mb-4" size={56} style={{ color: "#27AE60" }} />
            <p className="text-lg font-semibold" style={{ color: "#1E7E45" }}>
              ✓ Verified — This is a legitimate Aurat Sahara certificate
            </p>
            <div className="mt-6 space-y-2 text-left">
              <p style={{ color: "#3C5A47" }}>
                <span className="font-semibold">Name:</span> {data.full_name || "—"}
              </p>
              <p style={{ color: "#3C5A47" }}>
                <span className="font-semibold">Skill:</span> {data.skill || "—"}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl border-2 p-8 text-center"
            style={{ borderColor: "#E74C3C", backgroundColor: "#FDECEA" }}
          >
            <XCircle className="mx-auto mb-4" size={56} style={{ color: "#E74C3C" }} />
            <p className="text-lg font-semibold" style={{ color: "#B23A2E" }}>
              ✗ Invalid Certificate
            </p>
            <p className="mt-2 text-sm" style={{ color: "#B23A2E" }}>
              We could not verify this certificate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
