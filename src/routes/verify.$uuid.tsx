import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyCertificate } from "@/lib/certificates.functions";
import { getLang, isRtl, t } from "@/lib/i18n";
import mark from "@/assets/mark.png";

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
      dir={rtl ? "rtl" : "ltr"}
      className="aurat-page flex min-h-screen items-center justify-center px-6"
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={mark} alt="Aurat Sahara" width={1024} height={1024} className="h-16 w-16 object-contain" />
          <h1
            className="aurat-display mt-2 text-4xl font-bold"
            style={{ color: "#8B2252" }}
          >
            Aurat Sahara
          </h1>
        </div>


        {isLoading ? (
          <p className="text-center" style={{ color: "#8B2252", ...fontStyle }}>{tr.verifying}</p>
        ) : data?.valid ? (
          <div
            className="rounded-2xl border-2 p-8 text-center"
            style={{ borderColor: "#27AE60", backgroundColor: "#EAF7EF" }}
          >
            <CheckCircle2 className="mx-auto mb-4" size={56} style={{ color: "#27AE60" }} />
            <p className="text-lg font-semibold" style={{ color: "#1E7E45", ...fontStyle }}>
              {tr.verifiedMsg}
            </p>
            <div className="mt-6 space-y-2 text-left">
              <p style={{ color: "#3C5A47", ...fontStyle }}>
                <span className="font-semibold">{tr.nameLabel}</span> {data.full_name || "—"}
              </p>
              <p style={{ color: "#3C5A47", ...fontStyle }}>
                <span className="font-semibold">{tr.skillLabel}</span> {data.skill || "—"}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl border-2 p-8 text-center"
            style={{ borderColor: "#E74C3C", backgroundColor: "#FDECEA" }}
          >
            <XCircle className="mx-auto mb-4" size={56} style={{ color: "#E74C3C" }} />
            <p className="text-lg font-semibold" style={{ color: "#B23A2E", ...fontStyle }}>
              {tr.invalidCert}
            </p>
            <p className="mt-2 text-sm" style={{ color: "#B23A2E", ...fontStyle }}>
              {tr.couldNotVerify}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
