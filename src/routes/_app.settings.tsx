import { createFileRoute } from "@tanstack/react-router";
import { useArclight } from "@/lib/arclight-store";
import { Key, Shield, Webhook } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const workspace = useArclight((s) => s.workspace);
  const setWorkspace = useArclight((s) => s.setWorkspace);

  return (
    <div className="p-4 md:p-6 max-w-[900px] mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure provider API connections, alerting policies, and workspace identity.
        </p>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={15} className="text-[color:var(--cyan)]" />
          <h3 className="text-sm font-medium">Workspace</h3>
        </div>
        <label className="block">
          <span className="text-[10px] tracking-[0.18em] font-mono text-muted-foreground">
            WORKSPACE NAME
          </span>
          <input
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            className="mt-1 w-full bg-[oklch(0.18_0.025_260)] border border-[color:var(--panel-border)] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[color:var(--cyan)]"
          />
        </label>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Key size={15} className="text-[color:var(--neon-purple)]" />
          <h3 className="text-sm font-medium">Provider API Connections</h3>
        </div>
        <div className="space-y-2">
          {[
            { name: "OpenAI", status: "Connected", tone: "success" },
            { name: "Anthropic Claude", status: "Connected", tone: "success" },
            { name: "Google Gemini", status: "Read-only", tone: "warning" },
            { name: "AWS CloudWatch", status: "Connected", tone: "success" },
            { name: "Azure Monitor", status: "Not configured", tone: "danger" },
          ].map((p) => {
            const c =
              p.tone === "success"
                ? "var(--success)"
                : p.tone === "warning"
                  ? "var(--warning)"
                  : "var(--danger)";
            return (
              <div
                key={p.name}
                className="flex items-center justify-between px-3 py-2.5 rounded-md border border-[color:var(--panel-border)]"
              >
                <span className="text-sm">{p.name}</span>
                <span
                  className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-md border"
                  style={{
                    color: c,
                    borderColor: c,
                    background: `color-mix(in oklab, ${c} 12%, transparent)`,
                  }}
                >
                  {p.status.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Webhook size={15} className="text-[color:var(--neon-pink)]" />
          <h3 className="text-sm font-medium">Alerting</h3>
        </div>
        <div className="space-y-3 text-sm">
          {[
            { k: "Slack #intel-alerts", v: "Critical + High" },
            { k: "PagerDuty (on-call)", v: "Critical only" },
            { k: "Weekly briefing email", v: "Mondays · 09:00 UTC" },
          ].map((r) => (
            <div
              key={r.k}
              className="flex items-center justify-between px-3 py-2.5 rounded-md border border-[color:var(--panel-border)]"
            >
              <span>{r.k}</span>
              <span className="text-muted-foreground text-xs font-mono">{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
