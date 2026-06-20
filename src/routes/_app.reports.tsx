import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useArclight } from "@/lib/arclight-store";
import { computeSovereignty } from "@/lib/arclight";
import { Brain, FileText, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const ecosystem = useArclight((s) => s.ecosystem);
  const sov = useMemo(() => computeSovereignty(ecosystem), [ecosystem]);
  const top = sov.breakdown[0];

  const insights = [
    {
      icon: TrendingDown,
      tone: "danger",
      title: `${top?.provider ?? "OpenAI"} concentration is your dominant risk`,
      detail: `${top?.pct ?? 0}% of workflow exposure flows through a single vendor. A coordinated outage would collapse blast radius into a critical event.`,
    },
    {
      icon: Sparkles,
      tone: "cyan",
      title: "Claude is underutilized as a fallback",
      detail:
        "Anthropic capacity is healthy and policy-aligned. Shifting 20% of customer-support load would lift sovereignty by ~12 points.",
    },
    {
      icon: TrendingUp,
      tone: "success",
      title: "Vector + Postgres path is resilient",
      detail:
        "The search workflow has clean upstream isolation; failover rehearsals completed under 90s for the last 4 weeks.",
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Intelligence Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-generated insights, anomalies, and posture changes detected this cycle.
          </p>
        </div>
        <button className="text-sm px-3 py-2 rounded-md border border-[color:var(--panel-border)] inline-flex items-center gap-2 hover:border-[color:var(--cyan)]">
          <FileText size={14} /> Export weekly briefing
        </button>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={16} className="text-[color:var(--neon-purple)]" />
          <h3 className="text-sm font-medium">Executive Summary</h3>
          <span className="ml-auto text-[10px] font-mono tracking-widest text-muted-foreground">
            GENERATED · 02 MIN AGO
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your AI surface is operating at a{" "}
          <span className="text-foreground font-medium">
            sovereignty index of {sov.score} ({sov.risk})
          </span>
          . The largest structural risk is provider concentration on{" "}
          <span className="text-foreground font-medium">{top?.provider ?? "OpenAI"}</span>, which
          carries {top?.pct ?? 0}% of cross-workflow exposure. Three remediation paths are queued in
          the resilience plan; executing the top two would project the index to{" "}
          <span className="text-foreground font-medium">{Math.min(95, sov.score + 22)}</span>{" "}
          within one billing cycle.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {insights.map((i) => {
          const Icon = i.icon;
          const color =
            i.tone === "danger"
              ? "var(--danger)"
              : i.tone === "success"
                ? "var(--success)"
                : "var(--cyan)";
          return (
            <div key={i.title} className="panel p-5">
              <div
                className="w-9 h-9 rounded-lg grid place-items-center mb-3"
                style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
              >
                <Icon size={16} />
              </div>
              <div className="text-sm font-semibold leading-snug">{i.title}</div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{i.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="panel p-5">
        <h3 className="text-sm font-medium mb-3">System Health Timeline</h3>
        <div className="space-y-2">
          {[
            { time: "Today · 09:00", evt: "Shock test passed — Claude API slowdown", tone: "success" },
            { time: "Yesterday", evt: "OpenAI concentration crossed 45% threshold", tone: "warning" },
            { time: "2d ago", evt: "Added Pinecone redundancy for Vector Search", tone: "cyan" },
            { time: "5d ago", evt: "AWS us-east-1 region failover rehearsed", tone: "success" },
            { time: "1w ago", evt: "Policy change: cross-border AI data review enabled", tone: "warning" },
          ].map((e, i) => {
            const color =
              e.tone === "success"
                ? "var(--success)"
                : e.tone === "warning"
                  ? "var(--warning)"
                  : "var(--cyan)";
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-md border border-[color:var(--panel-border)]"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <span className="text-[11px] font-mono text-muted-foreground w-32 shrink-0">
                  {e.time}
                </span>
                <span className="text-sm">{e.evt}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
