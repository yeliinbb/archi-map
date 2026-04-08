import * as d3 from "d3";
import type { DiagramLayout } from "./types";

export const forceLayout: DiagramLayout = {
  name: "force",
  linkCurve: "arc",

  apply: ({ simulation, width, height }) => {
    simulation
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("collide", d3.forceCollide(30));
  },

  // Force: clean canvas, no grid — organic feel
  renderOverlay: ({ svg, width, height }) => {
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "var(--background)");
  },
};
