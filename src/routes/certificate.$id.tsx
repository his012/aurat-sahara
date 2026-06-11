import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
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
        {/* Certificate card */}
        <div
          className="cert-print relative mx-auto p-2.5 shadow-[0_30px_70px_-30px_rgba(139,34,82,0.45)]"
          style={{ backgroundColor: "#FAF5EE", border: "3px solid #C9A84C", borderRadius: "8px" }}
        >
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

