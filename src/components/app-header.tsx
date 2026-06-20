import { useRouterState } from "@tanstack/react-router";
import { Bell, Command, Search } from "lucide-react";
import { useArclight } from "@/lib/arclight-store";

const titles: Record<string, string> = {
  "/dashboard": "Mission Control",
  "/graph": "Dependency Topology",
  "/simulation": "Risk Simulation Lab",
  "/reports": "Intelligence Reports",
  "/ecosystem": "Ecosystem Builder",
  "/analytics": "Analytics & Trends",
  "/settings": "Workspace Settings",
};

export function AppHeader() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const workspace = useArclight((s) => s.workspace);
  const shock = useArclight((s) => s.shock);

  return (
    <header className="h-14 border-b border-[color:var(--panel-border)] px-4 md:px-6 flex items-center gap-4 bg-background/60 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <span>arclight</span>
        <span className="opacity-50">/</span>
        <span>{workspace}</span>
        <span className="opacity-50">/</span>
        <span className="text-foreground">{titles[pathname] ?? "Arclight"}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {shock && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border border-[color:var(--danger)] bg-[color:var(--danger)]/12 text-[11px] font-mono tracking-wider text-[color:var(--danger)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--danger)] animate-pulse" />
            SIM: {shock.label.toUpperCase()}
          </div>
        )}

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-[color:var(--panel-border)] bg-[oklch(0.20_0.025_260)]/60 text-xs text-muted-foreground min-w-[220px]">
          <Search size={13} />
          <span className="flex-1">Search nodes, workflows…</span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono">
            <Command size={10} /> K
          </span>
        </div>

        <button className="relative p-2 rounded-md hover:bg-[oklch(0.24_0.03_265)]/60 text-muted-foreground hover:text-foreground">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[color:var(--neon-pink)]" />
        </button>

        <div
          className="w-8 h-8 rounded-full grid place-items-center text-xs font-medium"
          style={{ background: "linear-gradient(135deg, var(--cyan), var(--neon-purple))" }}
        >
          AR
        </div>
      </div>
    </header>
  );
}
