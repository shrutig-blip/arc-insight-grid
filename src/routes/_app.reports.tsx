import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { useArclight } from "@/lib/arclight-store";
import { computeSovereignty, generateReport, relTime } from "@/lib/arclight";
import { Brain, Download, FileText, Sparkles, TrendingDown, TrendingUp, Info } from "lucide-react";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function downloadFile(filename: string, content: string, mime = "text/markdown") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ReportsPage() {
  const ecosystem = useArclight((s) => s.ecosystem);
  const shock = useArclight((s) => s.shock);
  const addReport = useArclight((s) => s.addReport);
  const reports = useArclight((s) => s.reports);
  const sov = useMemo(() => computeSovereignty(ecosystem), [ecosystem]);
  const top = sov.breakdown[0];

  const exportBriefing = () => {
    const md = generateReport(ecosystem, sov, shock);
    const rec = addReport({
      title: `Weekly briefing — ${new Date().toLocaleDateString()}`,
      score: sov.score,
      risk: sov.risk,
      markdown: md,
    });
    downloadFile(`arclight-${rec.id}.md`, md);
    toast.success("Briefing generated", { description: `Sovereignty ${sov.score} · ${sov.risk}` });
  };

  const exportJSON = () => {
    const payload = { generatedAt: new Date().toISOString(), sovereignty: sov, ecosystem, shock };
    downloadFile(`arclight-snapshot-${Date.now()}.json`, JSON.stringify(payload, null, 2), "application/json");
    toast.success("Snapshot exported as JSON");
  };

  const insights = [
    {
      icon: TrendingDown,
      tone: "danger",
      title: `${top?.provider ?? "OpenAI"} concentration is your dominant risk`,
      detail: `${top?.pct ?? 0}% of workflow exposure flows through a single vendor. A coordinated outage would collapse blast radius into a critical event.`,
      explain: `Calculated from ${ecosystem.nodes.filter(n => n.kind === "workflow").length} workflows × reachable providers. Penalty applies above 30% share.`,
    },
    {
      icon: Sparkles,
      tone: "cyan",
      title: "Claude is underutilized as a fallback",
      detail: "Anthropic capacity is healthy and policy-aligned. Shifting 20% of customer-support load would lift sovereignty by ~12 points.",
      explain: "Projected uplift = (concentration reduction × 1.4) + diversity bonus where Claude becomes a primary path.",
    },
    {
      icon: TrendingUp,
      tone: "success",
      title: "Vector + Postgres path is resilient",
      detail: "The search workflow has clean upstream isolation; failover rehearsals completed under 90s for the last 4 weeks.",
      explain: "Path isolation = no shared provider with another critical workflow ⇒ blast-radius contained.",
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
        <div className="flex items-center gap-2">
          <button
            onClick={exportJSON}
            className="text-sm px-3 py-2 rounded-md border border-[color:var(--panel-border)] inline-flex items-center gap-2 hover:border-[color:var(--cyan)]"
          >
            <Download size={14} /> JSON snapshot
          </button>
          <button
            onClick={exportBriefing}
            className="text-sm px-3 py-2 rounded-md font-medium inline-flex items-center gap-2 text-[color:var(--primary-foreground)] hover:brightness-110"
            style={{ background: "linear-gradient(90deg, var(--cyan), var(--neon-purple))" }}
          >
            <FileText size={14} /> Export weekly briefing
          </button>
        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={16} className="text-[color:var(--neon-purple)]" />
          <h3 className="text-sm font-medium">Executive Summary</h3>
          <span className="ml-auto text-[10px] font-mono tracking-widest text-muted-foreground">
            LIVE · {ecosystem.nodes.length} NODES
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your AI surface is operating at a{" "}
          <span className="text-foreground font-medium">sovereignty index of {sov.score} ({sov.risk})</span>.
          The largest structural risk is provider concentration on{" "}
          <span className="text-foreground font-medium">{top?.provider ?? "OpenAI"}</span>, which carries {top?.pct ?? 0}% of cross-workflow exposure.
          Three remediation paths are queued in the resilience plan; executing the top two would project the index to{" "}
          <span className="text-foreground font-medium">{Math.min(95, sov.score + 22)}</span> within one billing cycle.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {insights.map((i) => {
          const Icon = i.icon;
          const color =
            i.tone === "danger" ? "var(--danger)" : i.tone === "success" ? "var(--success)" : "var(--cyan)";
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
              <details className="mt-3 group">
                <summary className="cursor-pointer text-[10px] font-mono tracking-widest text-muted-foreground hover:text-[color:var(--cyan)] inline-flex items-center gap-1">
                  <Info size={11} /> WHY THIS MATTERS
                </summary>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed border-l border-[color:var(--panel-border)] pl-2">
                  {i.explain}
                </p>
              </details>
            </div>
          );
        })}
      </div>

      <div className="panel p-5">
        <h3 className="text-sm font-medium mb-3">Report History</h3>
        {reports.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No briefings yet — click <span className="text-foreground font-medium">Export weekly briefing</span> to generate one.</p>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-[color:var(--panel-border)]">
                <FileText size={14} className="text-[color:var(--cyan)]" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {relTime(r.ts)} · score {r.score} · {r.risk}
                  </div>
                </div>
                <button
                  onClick={() => downloadFile(`arclight-${r.id}.md`, r.markdown)}
                  className="text-[10px] font-mono text-muted-foreground hover:text-[color:var(--cyan)] inline-flex items-center gap-1"
                >
                  <Download size={12} /> DOWNLOAD
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
