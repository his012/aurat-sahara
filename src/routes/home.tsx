import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home · Aurat Sahara" },
      { name: "description", content: "Your Aurat Sahara home." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center"
      style={{ backgroundColor: "#FAF5EE" }}
    >
      <h1
        className="text-3xl font-bold"
        style={{ color: "#8B2252", fontFamily: "var(--font-display)" }}
      >
        Welcome to Aurat Sahara
      </h1>
      <p className="mt-3 text-base" style={{ color: "#6B5563" }}>
        You're signed in. Your home experience will appear here.
      </p>
    </div>
  );
}
