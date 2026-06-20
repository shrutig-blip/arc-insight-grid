import { createFileRoute } from "@tanstack/react-router";
import { ArclightApp } from "@/components/arclight-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arclight — AI Dependency Intelligence" },
      { name: "description", content: "Map, score, and stress-test the AI and cloud dependencies powering your organization." },
      { property: "og:title", content: "Arclight — AI Dependency Intelligence" },
      { property: "og:description", content: "Enterprise-grade visibility into AI sovereignty, dependency risk, and resilience." },
    ],
  }),
  component: Index,
});

function Index() {
  return <ArclightApp />;
}
