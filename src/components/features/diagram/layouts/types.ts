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

export interface RenderOverlayParams {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>;
  nodes: DiagramNode[];
  width: number;
  height: number;
}

export interface DiagramLayout {
  name: LayoutMode;
  apply: (params: ApplyLayoutParams) => void;
  renderOverlay?: (params: RenderOverlayParams) => void;
  linkCurve?: "straight" | "arc" | "orthogonal";
  linkOpacity?: number;
}
