import { create } from "zustand";
import {
  defaultEcosystem,
  type Ecosystem,
  type Shock,
  type DepNode,
  type NodeKind,
} from "./arclight";

interface ArclightState {
  ecosystem: Ecosystem;
  shock: Shock | null;
  selectedNodeId: string | null;
  authed: boolean;
  workspace: string;
  setShock: (s: Shock | null) => void;
  setSelected: (id: string | null) => void;
  setAuthed: (v: boolean) => void;
  setWorkspace: (w: string) => void;
  addDependency: (workflowLabel: string, providerLabel: string, kind: NodeKind) => void;
  removeNode: (id: string) => void;
  resetEcosystem: () => void;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const useArclight = create<ArclightState>((set) => ({
  ecosystem: defaultEcosystem,
  shock: null,
  selectedNodeId: null,
  authed: false,
  workspace: "production-ecosystem",
  setShock: (shock) => set({ shock }),
  setSelected: (id) => set({ selectedNodeId: id }),
  setAuthed: (v) => set({ authed: v }),
  setWorkspace: (w) => set({ workspace: w }),
  addDependency: (workflowLabel, providerLabel, kind) =>
    set((state) => {
      const wfId = `wf-${slug(workflowLabel)}-${Math.random().toString(36).slice(2, 6)}`;
      const provId = `${kind}-${slug(providerLabel)}`;
      const nodes: DepNode[] = [...state.ecosystem.nodes];
      const edges = [...state.ecosystem.edges];
      if (!nodes.find((n) => n.id === wfId)) {
        nodes.push({ id: wfId, label: workflowLabel, kind: "workflow" });
      }
      if (!nodes.find((n) => n.id === provId)) {
        nodes.push({
          id: provId,
          label: providerLabel,
          kind,
          provider: providerLabel,
        });
      }
      edges.push({ id: `e-${wfId}-${provId}`, source: wfId, target: provId });
      return { ecosystem: { nodes, edges } };
    }),
  removeNode: (id) =>
    set((state) => ({
      ecosystem: {
        nodes: state.ecosystem.nodes.filter((n) => n.id !== id),
        edges: state.ecosystem.edges.filter((e) => e.source !== id && e.target !== id),
      },
    })),
  resetEcosystem: () => set({ ecosystem: defaultEcosystem, shock: null, selectedNodeId: null }),
}));
