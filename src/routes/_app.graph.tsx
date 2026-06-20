import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useArclight } from "@/lib/arclight-store";
import { computeImpact } from "@/lib/arclight";
import { DependencyGraph } from "@/components/arclight-app";
import { Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_app/graph")({
  component: GraphPage,
});

function GraphPage() {
  const ecosystem = useArclight((s) => s.ecosystem);
  const shock = useArclight((s) => s.shock);
  const selectedId = useArclight((s) => s.selectedNodeId);
  const setSelected = useArclight((s) => s.setSelected);
  const removeNode = useArclight((s) => s.removeNode);

  const impact = useMemo(() => computeImpact(ecosystem, shock), [ecosystem, shock]);
  const selected = ecosystem.nodes.find((n) => n.id === selectedId) ?? null;
  const downstream = selected
    ? ecosystem.edges
        .filter((e) => e.source === selected.id)
        .map((e) => ecosystem.nodes.find((n) => n.id === e.target)!)
    : [];
  const upstream = selected
    ? ecosystem.edges
        .filter((e) => e.target === selected.id)
        .map((e) => ecosystem.nodes.find((n) => n.id === e.source)!)
    : [];

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dependency Topology</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Click any node to inspect its upstream consumers and downstream providers.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <Legend color="var(--neon-pink)" label="WORKFLOW" />
          <Legend color="var(--neon-purple)" label="AI" />
          <Legend color="var(--neon-blue)" label="API" />
          <Legend color="var(--success)" label="DB" />
          <Legend color="var(--cyan)" label="CLOUD" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <div className="panel relative overflow-hidden h-[calc(100vh-220px)] min-h-[500px]">
          <div className="absolute inset-0">
            <DependencyGraph ecosystem={ecosystem} shock={shock} onNodeClick={setSelected} />
          </div>
        </div>

        <div className="panel p-5 h-fit max-h-[calc(100vh-220px)] overflow-auto">
          {selected ? (
            <>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground">
                    {selected.kind.toUpperCase()}
                  </div>
                  <h3 className="text-lg font-semibold mt-0.5">{selected.label}</h3>
                  {selected.provider && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Provider · {selected.provider}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={15} />
                </button>
              </div>

              <div
                className="text-xs px-2 py-1 inline-flex rounded-md border mb-4"
                style={{
                  borderColor: impact.affectedNodeIds.has(selected.id)
                    ? "var(--danger)"
                    : "var(--success)",
                  color: impact.affectedNodeIds.has(selected.id)
                    ? "var(--danger)"
                    : "var(--success)",
                }}
              >
                {impact.affectedNodeIds.has(selected.id) ? "IMPACTED BY SHOCK" : "HEALTHY"}
              </div>

              <Section title="Upstream consumers" items={upstream} />
              <Section title="Downstream dependencies" items={downstream} />

              <button
                onClick={() => {
                  removeNode(selected.id);
                  setSelected(null);
                }}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-md border border-[color:var(--danger)]/40 text-[color:var(--danger)] hover:bg-[color:var(--danger)]/10"
              >
                <Trash2 size={12} /> Remove from ecosystem
              </button>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              <div className="text-[10px] font-mono tracking-[0.2em] mb-2">NODE INSPECTOR</div>
              Select a node in the graph to view its dependency chain, criticality, and remediation
              options.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: { id: string; label: string; kind: string }[];
}) {
  return (
    <div className="mt-3">
      <div className="text-[10px] font-mono tracking-[0.18em] text-muted-foreground mb-1.5">
        {title.toUpperCase()}
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-muted-foreground italic">None</div>
      ) : (
        <div className="space-y-1">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md border border-[color:var(--panel-border)] text-sm"
            >
              <span>{it.label}</span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {it.kind.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
