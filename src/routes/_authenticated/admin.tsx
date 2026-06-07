import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin · Aurat Sahara" }],
  }),
  component: Admin,
});

function Admin() {
  const navigate = useNavigate();
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#FAF5EE" }}
    >
      <h1 className="text-3xl font-bold" style={{ color: "#8B2252", fontFamily: "var(--font-display)" }}>
        Admin
      </h1>
      <p className="mt-3 text-base" style={{ color: "#6B5563" }}>
        Admin dashboard coming soon.
      </p>
      <button
        onClick={() => navigate({ to: "/home" })}
        className="mt-8 rounded-full px-6 py-3 font-semibold text-white"
        style={{ backgroundColor: "#C2587A" }}
      >
        Back to Home
      </button>
    </div>
  );
}
