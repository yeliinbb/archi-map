import * as d3 from "d3";
import type { DiagramNode } from "@/lib/diagram/transform";
import type { DiagramLayout } from "./types";

export const posterLayout: DiagramLayout = {
  name: "poster",
  apply: ({ simulation, nodes, width, height }) => {
    // Poster-style layout: large title area at top, cards in grid below
    const buildings = nodes.filter((n) => n.type === "building");
    const architects = nodes.filter((n) => n.type === "architect");
    const cities = nodes.filter((n) => n.type === "city");

    const topMargin = height * 0.15; // Title area
    const margin = 60;
    const contentH = height - topMargin - margin;
    const contentW = width - margin * 2;

    // Buildings in 2-column card layout
    const cols = Math.min(buildings.length, 3);
    const rows = Math.ceil(buildings.length / cols);
    const cardW = contentW / cols;
    const cardH = contentH * 0.7 / Math.max(rows, 1);

    buildings.forEach((b, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      b.fx = margin + col * cardW + cardW / 2;
      b.fy = topMargin + row * cardH + cardH / 2;
    });

    // Architects at bottom left
    const bottomY = height - margin;
    architects.forEach((a, i) => {
      const xStep = contentW * 0.5 / (architects.length + 1);
      a.fx = margin + (i + 1) * xStep;
      a.fy = bottomY;
    });

    // Cities at bottom right
    cities.forEach((c, i) => {
      const xStep = contentW * 0.5 / (cities.length + 1);
      c.fx = width / 2 + (i + 1) * xStep;
      c.fy = bottomY;
    });

    simulation
      .force("charge", null)
      .force("center", null)
      .force("collide", null)
      .force("x", d3.forceX((d) => (d as DiagramNode).fx ?? width / 2).strength(1))
      .force("y", d3.forceY((d) => (d as DiagramNode).fy ?? height / 2).strength(1))
      .alpha(0.3);
  },
};
