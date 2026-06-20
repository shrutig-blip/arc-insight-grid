import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useArclight } from "@/lib/arclight-store";
import { computeImpact, computeSovereignty, relTime } from "@/lib/arclight";
import {
  DependencyGraph,
  Metric,
  SovereigntyPanel,
} from "@/components/arclight-app";
import { Activity, AlertTriangle, ArrowRight, Network, Zap } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const ecosystem = useArclight((s) => s.ecosystem);
  const shock = useArclight((s) => s.shock);
  const sov = useMemo(() => computeSovereignty(ecosystem), [ecosystem]);
  const impact = useMemo(() => computeImpact(ecosystem, shock), [ecosystem, shock]);

  const workflowCount = ecosystem.nodes.filter((n) => n.kind === "workflow").length;
  const providerCount = new Set(ecosystem.nodes.filter((n) => n.provider).map((n) => n.provider!))
    .size;
  const aiCount = ecosystem.nodes.filter((n) => n.kind === "ai").length;

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mission Control</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time intelligence on AI and cloud dependency posture.
          </p>
        </div>
        <Link
          to="/simulation"
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-[color:var(--panel-border)] hover:border-[color:var(--cyan)]"
        >
          <Zap size={14} className="text-[color:var(--neon-pink)]" /> Run shock simulation
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric label="Workflows" value={String(workflowCount)} sub="under monitoring" />
        <Metric label="Providers" value={String(providerCount)} sub="active vendors" />
        <Metric label="AI Models" value={String(aiCount)} sub="in graph" tone="success" />
        <Metric
          label="Blast Radius"
          value={shock ? String(impact.affectedWorkflows.length) : "0"}
          sub={shock ? "workflows impacted" : "no active shock"}
          tone={shock ? "danger" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        <div className="panel relative overflow-hidden min-h-[460px]">
          <div className="absolute top-4 left-5 z-10">
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground font-mono">
              LIVE TOPOLOGY
            </div>
            <div className="text-base font-medium flex items-center gap-2">
              <Network size={14} className="text-[color:var(--cyan)]" /> Dependency map preview
            </div>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <Link
              to="/graph"
              className="text-[11px] font-mono text-muted-foreground hover:text-[color:var(--cyan)] inline-flex items-center gap-1"
            >
              OPEN FULL GRAPH <ArrowRight size={11} />
            </Link>
          </div>
          <div className="absolute inset-0">
            <DependencyGraph ecosystem={ecosystem} shock={shock} />
          </div>
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <SovereigntyPanel {...sov} />

          <RecentSignals />

        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={15} className="text-[color:var(--warning)]" />
          <h3 className="text-sm font-medium">Risk Summary</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <RiskRow
            level="Critical"
            count={sov.breakdown[0]?.pct > 50 ? 1 : 0}
            text="Single-vendor concentration above 50%"
          />
          <RiskRow
            level="High"
            count={sov.risk === "High" ? 2 : 1}
            text="Workflows lacking regional failover"
          />
          <RiskRow level="Medium" count={3} text="AI providers without cost circuit-breakers" />
        </div>
      </div>
    </div>
  );
}

function RiskRow({ level, count, text }: { level: string; count: number; text: string }) {
  const color =
    level === "Critical" ? "var(--danger)" : level === "High" ? "var(--warning)" : "var(--cyan)";
  return (
    <div className="rounded-lg border border-[color:var(--panel-border)] p-3">
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-md"
          style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
        >
          {level.toUpperCase()}
        </span>
        <span className="text-xl font-semibold" style={{ color }}>
          {count}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{text}</p>
    </div>
  );
}
