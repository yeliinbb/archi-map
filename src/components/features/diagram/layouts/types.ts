import type { DiagramNode, DiagramLink } from "@/lib/diagram/transform";

export type LayoutMode = "force" | "timeline" | "geography" | "blueprint" | "poster";

export interface LayoutConfig {
  name: LayoutMode;
  label: string;
  group: "analysis" | "graphics";
}

export interface ApplyLayoutParams {
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>;
  nodes: DiagramNode[];
  links: DiagramLink[];
  width: number;
  height: number;
}

export interface DiagramLayout {
  name: LayoutMode;
  apply: (params: ApplyLayoutParams) => void;
}
