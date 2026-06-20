import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useArclight } from "@/lib/arclight-store";
import { computeImpact, computeSovereignty } from "@/lib/arclight";
import {
  DependencyGraph,
  ResiliencePanel,
  ShockPanel,
  SovereigntyPanel,
} from "@/components/arclight-app";

export const Route = createFileRoute("/_app/simulation")({
  component: SimulationPage,
});

function SimulationPage() {
  const ecosystem = useArclight((s) => s.ecosystem);
  const shock = useArclight((s) => s.shock);
  const sov = useMemo(() => computeSovereignty(ecosystem), [ecosystem]);
  const impact = useMemo(() => computeImpact(ecosystem, shock), [ecosystem, shock]);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Risk Simulation Lab</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Trigger controlled failure scenarios and watch their propagation in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-4">
        <div className="flex flex-col gap-4 min-w-0">
          <ShockPanel />
          <SovereigntyPanel {...sov} />
        </div>

        <div className="panel relative overflow-hidden min-h-[520px]">
          <div className="absolute top-4 left-5 z-10">
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground font-mono">
              IMPACT PROPAGATION
            </div>
            <div className="text-base font-medium">
              {shock ? `Simulating: ${shock.label}` : "Baseline ecosystem"}
            </div>
          </div>
          <div className="absolute inset-0">
            <DependencyGraph ecosystem={ecosystem} shock={shock} />
          </div>
        </div>
      </div>

      <ResiliencePanel
        shock={shock}
        affectedWorkflows={impact.affectedWorkflows}
        baseScore={sov.score}
      />
    </div>
  );
}
