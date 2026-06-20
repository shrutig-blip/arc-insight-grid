export type NodeKind = "ai" | "cloud" | "api" | "workflow" | "database";

export interface DepNode {
  id: string;
  label: string;
  kind: NodeKind;
  provider?: string;
}

export interface DepEdge {
  id: string;
  source: string;
  target: string;
}

export interface Ecosystem {
  nodes: DepNode[];
  edges: DepEdge[];
}

export const defaultEcosystem: Ecosystem = {
  nodes: [
    { id: "wf-support", label: "Customer Support", kind: "workflow" },
    { id: "wf-search", label: "Internal Search", kind: "workflow" },
    { id: "wf-analytics", label: "Analytics Pipeline", kind: "workflow" },
    { id: "wf-recs", label: "Recommendations", kind: "workflow" },

    { id: "ai-openai", label: "OpenAI GPT-4", kind: "ai", provider: "OpenAI" },
    { id: "ai-gemini", label: "Google Gemini", kind: "ai", provider: "Gemini" },
    { id: "ai-claude", label: "Anthropic Claude", kind: "ai", provider: "Claude" },

    { id: "api-vector", label: "Vector Search API", kind: "api" },
    { id: "db-postgres", label: "Postgres", kind: "database" },

    { id: "cloud-aws", label: "AWS", kind: "cloud", provider: "AWS" },
    { id: "cloud-azure", label: "Azure", kind: "cloud", provider: "Azure" },
  ],
  edges: [
    { id: "e1", source: "wf-support", target: "ai-openai" },
    { id: "e2", source: "wf-search", target: "ai-openai" },
    { id: "e3", source: "wf-search", target: "api-vector" },
    { id: "e4", source: "wf-analytics", target: "ai-gemini" },
    { id: "e5", source: "wf-recs", target: "ai-openai" },
    { id: "e6", source: "wf-recs", target: "ai-claude" },
    { id: "e7", source: "api-vector", target: "db-postgres" },
    { id: "e8", source: "ai-openai", target: "cloud-aws" },
    { id: "ai-gemini-cloud", source: "ai-gemini", target: "cloud-aws" },
    { id: "e9", source: "db-postgres", target: "cloud-aws" },
    { id: "e10", source: "ai-claude", target: "cloud-azure" },
  ],
};

export type ShockType = "openai-down" | "aws-outage" | "cost-increase" | "policy-restriction";

export interface Shock {
  id: ShockType;
  label: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  affectedProviders: string[];
}

export const shocks: Shock[] = [
  { id: "openai-down", label: "OpenAI Outage", description: "OpenAI APIs unreachable globally", severity: "critical", affectedProviders: ["OpenAI"] },
  { id: "aws-outage", label: "AWS Region Down", description: "us-east-1 hard failure cascading", severity: "critical", affectedProviders: ["AWS"] },
  { id: "cost-increase", label: "AI Cost Spike", description: "Model pricing rises 4× overnight", severity: "medium", affectedProviders: ["OpenAI", "Claude"] },
  { id: "policy-restriction", label: "Data Policy Shift", description: "Cross-border AI data restricted", severity: "high", affectedProviders: ["OpenAI", "Gemini"] },
];

export function computeImpact(eco: Ecosystem, shock: Shock | null) {
  if (!shock) return { affectedNodeIds: new Set<string>(), affectedEdgeIds: new Set<string>(), affectedWorkflows: [] as DepNode[] };
  const directly = new Set(
    eco.nodes.filter((n) => n.provider && shock.affectedProviders.includes(n.provider)).map((n) => n.id),
  );
  const affected = new Set(directly);
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of eco.edges) {
      if (affected.has(e.target) && !affected.has(e.source)) {
        affected.add(e.source);
        changed = true;
      }
    }
  }
  const affectedEdgeIds = new Set(
    eco.edges.filter((e) => affected.has(e.source) && affected.has(e.target)).map((e) => e.id),
  );
  const affectedWorkflows = eco.nodes.filter((n) => n.kind === "workflow" && affected.has(n.id));
  return { affectedNodeIds: affected, affectedEdgeIds, affectedWorkflows };
}

export function computeSovereignty(eco: Ecosystem) {
  const providerLoad: Record<string, number> = {};
  const workflows = eco.nodes.filter((n) => n.kind === "workflow");
  for (const wf of workflows) {
    const visited = new Set<string>([wf.id]);
    const stack = [wf.id];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const e of eco.edges) if (e.source === cur && !visited.has(e.target)) { visited.add(e.target); stack.push(e.target); }
    }
    for (const id of visited) {
      const n = eco.nodes.find((x) => x.id === id);
      if (n?.provider) providerLoad[n.provider] = (providerLoad[n.provider] ?? 0) + 1;
    }
  }
  const total = Object.values(providerLoad).reduce((a, b) => a + b, 0) || 1;
  const breakdown = Object.entries(providerLoad)
    .map(([provider, count]) => ({ provider, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  const topShare = breakdown[0]?.pct ?? 0;
  const diversity = breakdown.length;
  const concentrationPenalty = Math.max(0, topShare - 30);
  const diversityBonus = Math.min(20, diversity * 5);
  const score = Math.max(5, Math.min(100, 100 - concentrationPenalty * 1.4 + diversityBonus - 15));
  const rounded = Math.round(score);
  const risk: "Low" | "Medium" | "High" = rounded >= 70 ? "Low" : rounded >= 45 ? "Medium" : "High";

  const explain = [
    { label: "Base", delta: 100, note: "Starting score" },
    { label: "Concentration penalty", delta: -Math.round(concentrationPenalty * 1.4), note: `Top provider ${breakdown[0]?.provider ?? "—"} carries ${topShare}% (>30% penalized)` },
    { label: "Diversity bonus", delta: +diversityBonus, note: `${diversity} distinct providers (×5, capped at 20)` },
    { label: "Operational tax", delta: -15, note: "Constant for runtime + policy overhead" },
  ];

  return { score: rounded, risk, breakdown, explain, topShare, diversity };
}

export function generateReport(
  eco: Ecosystem,
  sov: ReturnType<typeof computeSovereignty>,
  shock: Shock | null,
) {
  const date = new Date().toISOString();
  const wfCount = eco.nodes.filter((n) => n.kind === "workflow").length;
  const providers = new Set(eco.nodes.filter((n) => n.provider).map((n) => n.provider!)).size;
  const top = sov.breakdown[0];
  const md = `# Arclight Intelligence Briefing
Generated: ${date}

## Posture
- Sovereignty Index: **${sov.score} / 100** (${sov.risk})
- Workflows under monitoring: ${wfCount}
- Distinct providers: ${providers}
- Top concentration: ${top?.provider ?? "n/a"} @ ${top?.pct ?? 0}%
- Active simulation: ${shock ? shock.label + " (" + shock.severity + ")" : "none"}

## Score Explainability
${sov.explain.map((e) => `- ${e.label}: ${e.delta >= 0 ? "+" : ""}${e.delta} — ${e.note}`).join("\n")}

## Provider Breakdown
${sov.breakdown.map((b) => `- ${b.provider}: ${b.pct}%`).join("\n")}

## Recommendations
1. Diversify model providers — keep any single vendor below 40% of cross-workflow exposure.
2. Establish failover runbooks per critical workflow.
3. Schedule weekly shock tests on the top-2 concentrated providers.
`;
  return md;
}

export function relTime(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
