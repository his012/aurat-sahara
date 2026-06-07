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

function maskCnic(cnic: string | null): string {
  if (!cnic) return "—";
  const digits = cnic.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  return `*********${last4}`;
}

function Admin() {
  const navigate = useNavigate();
  const fetchAll = useServerFn(getAllRequests);
  const doAction = useServerFn(adminAction);

  const [filter, setFilter] = useState<Filter>("all");
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
    <div className="min-h-screen px-4 py-6 md:px-8" style={{ backgroundColor: "#FAF5EE" }}>
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((r: AdminRequest) => (
            <div
              key={r.id}
              className="rounded-2xl border bg-white/80 p-5"
              style={{ borderColor: "#F0C9DD" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "#5A4650" }}>
                    {r.full_name || "—"}
                  </h3>
                  <p className="text-sm" style={{ color: "#8B2252" }}>
                    {r.skill || "—"}
                  </p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold capitalize text-white"
                  style={{ backgroundColor: STATUS_COLORS[r.status] ?? "#999" }}
                >
                  {r.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm" style={{ color: "#6B5563" }}>
                <span>Age: {r.age ?? "—"}</span>
                <span>City: {r.city || "—"}</span>
                <span className="col-span-2">CNIC: {maskCnic(r.cnic_number)}</span>
                <span className="col-span-2 text-xs" style={{ color: "#9B8794" }}>
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>

              {r.thumb_urls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.thumb_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt="work proof" className="h-16 w-16 rounded-lg object-cover" />
                    </a>
                  ))}
                </div>
              )}

              {r.comment && r.status === "declined" && (
                <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "#FBEAEA", color: "#B33B3B" }}>
                  Reason: {r.comment}
                </p>
              )}

              {r.status === "pending" && (
                <div className="mt-4">
                  {declineFor === r.id ? (
                    <div className="space-y-2">
                      <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason for declining (required)"
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                        style={{ borderColor: "#D4A0B8" }}
                        autoFocus
                      />
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
          ))}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
