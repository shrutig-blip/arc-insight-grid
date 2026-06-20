import { Handle, Position, type NodeProps } from "reactflow";
import { Cloud, Database, GitBranch, Sparkles, Workflow } from "lucide-react";
import type { NodeKind } from "@/lib/arclight";

const kindMeta: Record<NodeKind, { icon: typeof Cloud; color: string; label: string }> = {
  ai:        { icon: Sparkles,  color: "var(--neon-purple)", label: "AI MODEL" },
  cloud:     { icon: Cloud,     color: "var(--cyan)",        label: "CLOUD" },
  api:       { icon: GitBranch, color: "var(--neon-blue)",   label: "API" },
  workflow:  { icon: Workflow,  color: "var(--neon-pink)",   label: "WORKFLOW" },
  database:  { icon: Database,  color: "var(--success)",     label: "DATABASE" },
};

export interface ArcNodeData {
  label: string;
  kind: NodeKind;
  provider?: string;
  affected?: boolean;
}

export function ArcNode({ data }: NodeProps<ArcNodeData>) {
  const meta = kindMeta[data.kind];
  const Icon = meta.icon;
  return (
    <div
      className={`group relative rounded-xl border bg-[oklch(0.20_0.025_260)]/90 backdrop-blur px-3 py-2.5 min-w-[170px] transition ${
        data.affected ? "pulse-danger border-[color:var(--danger)]" : "border-[color:var(--panel-border)] hover:border-[color:var(--cyan)]"
      }`}
      style={{ boxShadow: data.affected ? undefined : `0 0 0 1px transparent` }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-[color:var(--cyan)] !border-0" />
      <div className="flex items-center gap-2">
        <div
          className="grid place-items-center w-8 h-8 rounded-lg"
          style={{ background: `color-mix(in oklab, ${meta.color} 18%, transparent)`, color: meta.color }}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.14em] text-muted-foreground font-mono">{meta.label}</div>
          <div className="text-sm font-medium text-foreground truncate">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-[color:var(--cyan)] !border-0" />
    </div>
  );
}
