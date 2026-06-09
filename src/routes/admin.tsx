import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { getAllRequests, adminAction, type AdminRequest } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin · Aurat Sahara" }],
  }),
  component: Admin,
});

const STATUS_COLORS: Record<string, string> = {
  pending: "#F5A623",
  approved: "#27AE60",
  declined: "#E74C3C",
};

type Filter = "all" | "pending" | "approved" | "declined";
const FILTERS: Filter[] = ["all", "pending", "approved", "declined"];

const DECLINE_TEMPLATES = [
  "Tasaweer (images) saaf nahi hain — behtar quality ki tasaweer dobara bhejein.",
  "Diya gaya kaam aapki bayan ki gayi skill se mutabiqat nahi rakhta.",
  "Maloomat mukammal nahi hai — baraye meharbani tamam tafseelat faraham karein.",
  "Kaam ka saboot kaafi nahi — mazeed namoonay (samples) darkaar hain.",
  "CNIC ki maloomat tasdeeq nahi ho saki — durust maloomat bhejein.",
];

function Admin() {
  const navigate = useNavigate();
  const fetchAll = useServerFn(getAllRequests);
  const doAction = useServerFn(adminAction);

  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [declineFor, setDeclineFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const { data: requests = [], refetch, isLoading } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: () => fetchAll(),
  });

  const filtered = requests.filter((r) => filter === "all" || r.status === filter);

  const approve = async (id: string) => {
    setBusy(id);
    const res = await doAction({ data: { action: "approve", request_id: id } });
    setBusy(null);
    if (res.ok) {
      toast.success("Application approved.");
      refetch();
    } else {
      toast.error(res.error || "Failed.");
    }
  };

  const decline = async (id: string) => {
    if (!reason.trim()) {
      toast.error("Reason is required to decline.");
      return;
    }
    setBusy(id);
    const res = await doAction({
      data: { action: "decline", request_id: id, comment: reason.trim() },
    });
    setBusy(null);
    if (res.ok) {
      toast.success("Application declined.");
      setDeclineFor(null);
      setReason("");
      refetch();
    } else {
      toast.error(res.error || "Failed.");
    }
  };

  return (
    <div className="aurat-page min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold" style={{ color: "#8B2252", fontFamily: "var(--font-display)" }}>
            Admin Dashboard
          </h1>
          <button
            onClick={() => navigate({ to: "/home" })}
            className="text-sm font-medium"
            style={{ color: "#8B2252" }}
          >
            ← Home
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f === "all" ? requests.length : requests.filter((r) => r.status === f).length;
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors"
                style={
                  active
                    ? { backgroundColor: "#C2587A", color: "#fff" }
                    : { backgroundColor: "#fff", color: "#8B2252", border: "1px solid #F0C9DD" }
                }
              >
                {f} ({count})
              </button>
            );
          })}
        </div>

        {isLoading && <p style={{ color: "#9B8794" }}>Loading…</p>}
        {!isLoading && filtered.length === 0 && (
          <p style={{ color: "#9B8794" }}>No applications in this category.</p>
        )}

        <div className="space-y-3">
          {filtered.map((r: AdminRequest) => {
            const isOpen = expanded === r.id;
            return (
              <div
                key={r.id}
                className="rounded-2xl border bg-white/80"
                style={{ borderColor: "#F0C9DD" }}
              >
                {/* Header row — click to expand */}
                <button
                  onClick={() => {
                    setExpanded(isOpen ? null : r.id);
                    if (declineFor === r.id) {
                      setDeclineFor(null);
                      setReason("");
                    }
                  }}
                  className="flex w-full items-center justify-between gap-3 p-5 text-left"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold" style={{ color: "#5A4650" }}>
                      {r.full_name || "—"}
                    </h3>
                    <p className="truncate text-sm" style={{ color: "#8B2252" }}>
                      {r.skill || "—"}
                    </p>
                    <p className="text-xs" style={{ color: "#9B8794" }}>
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold capitalize text-white"
                      style={{ backgroundColor: STATUS_COLORS[r.status] ?? "#999" }}
                    >
                      {r.status}
                    </span>
                    <span style={{ color: "#8B2252" }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </button>

                {/* Expanded details */}
                {isOpen && (
                  <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: "#F5E2EC" }}>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2" style={{ color: "#5A4650" }}>
                      <Detail label="Full Name" value={r.full_name} />
                      <Detail label="Skill" value={r.skill} />
                      <Detail label="Age" value={r.age != null ? String(r.age) : null} />
                      <Detail label="City" value={r.city} />
                      <Detail label="CNIC Number" value={r.cnic_number} />
                      <Detail label="Education" value={r.education} />
                      <Detail label="Experience" value={r.experience} full />
                    </div>

                    {r.thumb_urls.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-2 text-sm font-semibold" style={{ color: "#8B2252" }}>
                          Work Proof ({r.thumb_urls.length})
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {r.thumb_urls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                              <img
                                src={url}
                                alt={`work proof ${i + 1}`}
                                className="h-40 w-40 rounded-lg border object-cover"
                                style={{ borderColor: "#F0C9DD" }}
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {r.comment && r.status === "declined" && (
                      <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "#FBEAEA", color: "#B33B3B" }}>
                        Decline reason: {r.comment}
                      </p>
                    )}

                    {r.status === "pending" && (
                      <div className="mt-5">
                        {declineFor === r.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder="Reason for declining (required)"
                              rows={3}
                              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                              style={{ borderColor: "#D4A0B8" }}
                              autoFocus
                            />
                            <div>
                              <p className="mb-2 text-xs font-medium" style={{ color: "#9B8794" }}>
                                Quick reasons — tap to use:
                              </p>
                              <div className="flex flex-col gap-2">
                                {DECLINE_TEMPLATES.map((t, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setReason(t)}
                                    className="rounded-lg border px-3 py-2 text-left text-sm transition-colors"
                                    style={{
                                      borderColor: reason === t ? "#C2587A" : "#F0C9DD",
                                      backgroundColor: reason === t ? "#FBEFF4" : "#fff",
                                      color: "#5A4650",
                                    }}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => decline(r.id)}
                                disabled={busy === r.id}
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                style={{ backgroundColor: "#E74C3C" }}
                              >
                                Confirm Decline
                              </button>
                              <button
                                onClick={() => {
                                  setDeclineFor(null);
                                  setReason("");
                                }}
                                className="rounded-lg px-4 py-2 text-sm font-medium"
                                style={{ color: "#6B5563" }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approve(r.id)}
                              disabled={busy === r.id}
                              className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                              style={{ backgroundColor: "#27AE60" }}
                            >
                              Approve ✓
                            </button>
                            <button
                              onClick={() => {
                                setDeclineFor(r.id);
                                setReason("");
                              }}
                              className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                              style={{ backgroundColor: "#E74C3C" }}
                            >
                              Decline ✗
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

function Detail({ label, value, full }: { label: string; value: string | null; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#9B8794" }}>
        {label}
      </p>
      <p className="whitespace-pre-wrap" style={{ color: "#5A4650" }}>
        {value || "—"}
      </p>
    </div>
  );
}
