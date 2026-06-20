import { useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  type Edge,
  type Node,
} from "reactflow";
import { motion } from "framer-motion";
import { ArcNode, type ArcNodeData } from "@/components/arc-node";
import {
  computeImpact,
  computeSovereignty,
  shocks,
  type Ecosystem,
  type Shock,
} from "@/lib/arclight";
import { useArclight } from "@/lib/arclight-store";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Radio,
  Shield,
  Zap,
  X,
} from "lucide-react";

const nodeTypes = { arc: ArcNode };

const columnOf: Record<string, number> = {
  workflow: 0,
  api: 1,
  ai: 1,
  database: 2,
  cloud: 2,
};

function layout(eco: Ecosystem): { nodes: Node<ArcNodeData>[]; edges: Edge[] } {
  const byCol: Record<number, string[]> = { 0: [], 1: [], 2: [] };
  for (const n of eco.nodes) byCol[columnOf[n.kind]].push(n.id);
  const positions: Record<string, { x: number; y: number }> = {};
  Object.entries(byCol).forEach(([col, ids]) => {
    const c = Number(col);
    const gap = 110;
    const startY = -((ids.length - 1) * gap) / 2;
    ids.forEach((id, i) => {
      positions[id] = { x: c * 320, y: startY + i * gap + 300 };
    });
  });
  const nodes: Node<ArcNodeData>[] = eco.nodes.map((n) => ({
    id: n.id,
    type: "arc",
    position: positions[n.id] ?? { x: 0, y: 0 },
    data: { label: n.label, kind: n.kind, provider: n.provider },
  }));
  const edges: Edge[] = eco.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed, color: "oklch(0.6 0.1 250)" },
  }));
  return { nodes, edges };
}

export function DependencyGraph({
  ecosystem,
  shock,
  onNodeClick,
}: {
  ecosystem: Ecosystem;
  shock: Shock | null;
  onNodeClick?: (id: string) => void;
}) {
  const base = useMemo(() => layout(ecosystem), [ecosystem]);
  const impact = useMemo(() => computeImpact(ecosystem, shock), [ecosystem, shock]);
  const nodes = base.nodes.map((n) => ({
    ...n,
    data: { ...n.data, affected: impact.affectedNodeIds.has(n.id) },
  }));
  const edges = base.edges.map((e) => ({
    ...e,
    className: impact.affectedEdgeIds.has(e.id) ? "affected" : undefined,
    animated: impact.affectedEdgeIds.has(e.id),
  }));
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      proOptions={{ hideAttribution: false }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      panOnScroll
      zoomOnScroll={false}
      onNodeClick={(_, n) => onNodeClick?.(n.id)}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={28}
        size={1}
        color="oklch(0.35 0.03 260 / 0.6)"
      />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

export function SovereigntyPanel({
  score,
  risk,
  breakdown,
  explain,
}: ReturnType<typeof computeSovereignty>) {
  const [showExplain, setShowExplain] = useState(false);
  const riskColor =
    risk === "Low" ? "var(--success)" : risk === "Medium" ? "var(--warning)" : "var(--danger)";
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="panel p-5 relative overflow-hidden scan-line">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[color:var(--cyan)]" />
          <h3 className="text-sm font-medium tracking-wide">Sovereignty Index</h3>
        </div>
        <button
          onClick={() => setShowExplain((v) => !v)}
          className="text-[10px] font-mono tracking-widest text-muted-foreground hover:text-[color:var(--cyan)] transition"
        >
          {showExplain ? "HIDE MATH" : "EXPLAIN"}
        </button>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r={r} stroke="oklch(0.28 0.03 260)" strokeWidth="10" fill="none" />
            <circle
              cx="60"
              cy="60"
              r={r}
              stroke="url(#g)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c}`}
              style={{ transition: "stroke-dasharray 800ms ease" }}
            />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0%" stopColor="oklch(0.82 0.15 200)" />
                <stop offset="100%" stopColor="oklch(0.68 0.20 295)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-3xl font-semibold neon-text leading-none">{score}</div>
              <div className="text-[10px] tracking-[0.18em] text-muted-foreground mt-1 font-mono">/ 100</div>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono">Risk Level</div>
          <div
            className="mt-1 inline-flex items-center gap-2 px-2.5 py-1 rounded-md border"
            style={{
              borderColor: riskColor,
              color: riskColor,
              background: `color-mix(in oklab, ${riskColor} 14%, transparent)`,
            }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: riskColor }} />
            <span className="text-sm font-medium">{risk}</span>
          </div>
          <div className="mt-4 space-y-2">
            {breakdown.slice(0, 5).map((b) => (
              <div key={b.provider}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-mono">{b.provider}</span>
                  <span className="font-medium">{b.pct}%</span>
                </div>
                <div className="h-1.5 bg-[oklch(0.28_0.03_260)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${b.pct}%`,
                      background: "linear-gradient(90deg, var(--cyan), var(--neon-purple))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showExplain ? (
        <div className="mt-4 border-t border-[color:var(--panel-border)] pt-3 space-y-1.5">
          <div className="text-[10px] tracking-[0.18em] font-mono text-muted-foreground mb-1">SCORE COMPOSITION</div>
          {explain.map((e) => (
            <div key={e.label} className="flex items-start gap-3 text-xs">
              <span
                className="font-mono w-12 text-right shrink-0"
                style={{ color: e.delta > 0 ? "var(--success)" : e.delta < 0 ? "var(--danger)" : "var(--cyan)" }}
              >
                {e.delta > 0 ? "+" : ""}{e.delta}
              </span>
              <div className="flex-1">
                <div className="font-medium">{e.label}</div>
                <div className="text-muted-foreground text-[11px]">{e.note}</div>
              </div>
            </div>
          ))}
          <div className="text-[10px] font-mono text-muted-foreground pt-2">
            Formula: max(5, min(100, 100 − concentration×1.4 + diversity − 15))
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground border-t border-[color:var(--panel-border)] pt-3 leading-relaxed">
          Score reflects provider concentration and ecosystem diversity. High dependence on a single
          vendor reduces sovereignty.
        </p>
      )}
    </div>
  );
}

export function ShockPanel() {
  const shock = useArclight((s) => s.shock);
  const setShock = useArclight((s) => s.setShock);
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[color:var(--neon-pink)]" />
          <h3 className="text-sm font-medium tracking-wide">Shock Simulation</h3>
        </div>
        {shock && (
          <button
            onClick={() => setShock(null)}
            className="text-[10px] font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <X size={12} /> CLEAR
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {shocks.map((s) => {
          const isActive = shock?.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setShock(isActive ? null : s)}
              className={`text-left rounded-lg border px-3 py-2.5 transition group ${
                isActive
                  ? "border-[color:var(--danger)] bg-[color:var(--danger)]/10"
                  : "border-[color:var(--panel-border)] hover:border-[color:var(--cyan)] hover:bg-[oklch(0.28_0.04_270)]/40"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Radio
                  size={11}
                  className={isActive ? "text-[color:var(--danger)]" : "text-[color:var(--cyan)]"}
                />
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                  {s.severity}
                </span>
              </div>
              <div className="text-sm font-medium mt-1">{s.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {s.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ResiliencePanel({
  shock,
  affectedWorkflows,
  baseScore,
}: {
  shock: Shock | null;
  affectedWorkflows: { id: string; label: string }[];
  baseScore: number;
}) {
  const blastRadius = affectedWorkflows.length;
  const severityScore = shock ? { low: 1, medium: 2, high: 3, critical: 4 }[shock.severity] : 0;
  const projected = Math.min(95, baseScore + 28 + (shock ? 5 : 0));

  const recs = shock
    ? [
        {
          title: `Add backup provider for ${shock.affectedProviders.join(", ")}`,
          detail: "Route 30% traffic to a secondary vendor with SLA parity.",
        },
        {
          title: "Enable open-source fallback",
          detail: "Deploy a self-hosted model for critical workflows under outage.",
        },
        {
          title: "Multi-region redundancy",
          detail: "Replicate state across two cloud regions; failover under 90s.",
        },
      ]
    : [
        {
          title: "Diversify model providers",
          detail: "Reduce single-vendor concentration below 40% per workflow.",
        },
        {
          title: "Define failure runbooks",
          detail: "Document automated fallback paths for each AI workflow.",
        },
        {
          title: "Continuous shock testing",
          detail: "Schedule weekly simulated outages on critical paths.",
        },
      ];

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[color:var(--success)]" />
          <h3 className="text-sm font-medium tracking-wide">Resilience Plan</h3>
        </div>
        <span className="text-[10px] font-mono tracking-widest text-muted-foreground">
          {shock ? "SCENARIO ACTIVE" : "BASELINE"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Metric
          label="Blast Radius"
          value={`${blastRadius}`}
          sub="workflows"
          tone={blastRadius > 2 ? "danger" : "default"}
        />
        <Metric
          label="Severity"
          value={shock ? shock.severity.toUpperCase() : "—"}
          sub="impact"
          tone={severityScore >= 3 ? "danger" : severityScore >= 2 ? "warning" : "default"}
        />
        <Metric
          label="Projected"
          value={`${baseScore} → ${projected}`}
          sub="score uplift"
          tone="success"
        />
      </div>

      {shock && affectedWorkflows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/8 p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={13} className="text-[color:var(--danger)]" />
            <span className="text-[11px] font-mono tracking-widest text-[color:var(--danger)]">
              IMPACTED WORKFLOWS
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {affectedWorkflows.map((w) => (
              <span
                key={w.id}
                className="text-xs px-2 py-0.5 rounded-md bg-[color:var(--danger)]/15 border border-[color:var(--danger)]/30"
              >
                {w.label}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        <div className="text-[10px] tracking-[0.18em] text-muted-foreground font-mono mb-1">
          AI RECOMMENDATIONS
        </div>
        {recs.map((r, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-[color:var(--panel-border)] px-3 py-2.5 hover:border-[color:var(--cyan)]/50 transition"
          >
            <CheckCircle2 size={14} className="text-[color:var(--cyan)] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{r.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{r.detail}</div>
            </div>
            <ArrowUpRight size={14} className="text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Metric({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "default" | "danger" | "warning" | "success";
}) {
  const color =
    tone === "danger"
      ? "var(--danger)"
      : tone === "warning"
        ? "var(--warning)"
        : tone === "success"
          ? "var(--success)"
          : "var(--cyan)";
  return (
    <div className="rounded-lg border border-[color:var(--panel-border)] p-3">
      <div className="text-[10px] tracking-[0.16em] text-muted-foreground font-mono">
        {label.toUpperCase()}
      </div>
      <div className="text-lg font-semibold mt-1" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-6 h-6" : "w-7 h-7";
  return (
    <div className="flex items-center gap-2">
      <div
        className={`relative ${s} grid place-items-center rounded-md`}
        style={{ background: "linear-gradient(135deg, var(--cyan), var(--neon-purple))" }}
      >
        <div className="absolute inset-0.5 rounded-[5px] bg-background grid place-items-center">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "linear-gradient(135deg, var(--cyan), var(--neon-purple))" }}
          />
        </div>
      </div>
      <div className="text-sm font-semibold tracking-[0.18em]">ARCLIGHT</div>
    </div>
  );
}
