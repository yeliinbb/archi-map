import { forceLayout } from "./force-layout";
import { timelineLayout } from "./timeline-layout";
import { geographyLayout } from "./geography-layout";
import { blueprintLayout } from "./blueprint-layout";
import { posterLayout } from "./poster-layout";
import type { DiagramLayout, LayoutMode, LayoutConfig } from "./types";

export type { DiagramLayout, LayoutMode, LayoutConfig };

export const LAYOUTS: Record<LayoutMode, DiagramLayout> = {
  force: forceLayout,
  timeline: timelineLayout,
  geography: geographyLayout,
  blueprint: blueprintLayout,
  poster: posterLayout,
};

export const LAYOUT_CONFIGS: LayoutConfig[] = [
  { name: "force", label: "Force", group: "analysis" },
  { name: "timeline", label: "Timeline", group: "analysis" },
  { name: "geography", label: "Geography", group: "analysis" },
  { name: "blueprint", label: "Blueprint", group: "graphics" },
  { name: "poster", label: "Poster", group: "graphics" },
];
