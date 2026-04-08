import * as d3 from "d3";
import type { DiagramNode } from "@/lib/diagram/transform";
import type { DiagramLayout } from "./types";

export const blueprintLayout: DiagramLayout = {
  name: "blueprint",
  apply: ({ simulation, nodes, width, height }) => {
    // Grid-based architectural drawing layout
    // Buildings in rows, architects on left column, cities on right column
    const buildings = nodes.filter((n) => n.type === "building");
    const architects = nodes.filter((n) => n.type === "architect");
    const cities = nodes.filter((n) => n.type === "city");

    const margin = 80;
    const gridW = width - margin * 2;
    const gridH = height - margin * 2;

    // Buildings in a grid
    const cols = Math.ceil(Math.sqrt(buildings.length * 1.5));
    const rows = Math.ceil(buildings.length / cols);
    const cellW = gridW / (cols + 2); // +2 for architect/city columns
    const cellH = gridH / Math.max(rows, 1);

    buildings.forEach((b, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      b.fx = margin + cellW + col * cellW + cellW / 2;
      b.fy = margin + row * cellH + cellH / 2;
    });

    // Architects on left column
    architects.forEach((a, i) => {
      const yStep = gridH / (architects.length + 1);
      a.fx = margin + cellW / 2;
      a.fy = margin + (i + 1) * yStep;
    });

    // Cities on right column
    cities.forEach((c, i) => {
      const yStep = gridH / (cities.length + 1);
      c.fx = width - margin - cellW / 2;
      c.fy = margin + (i + 1) * yStep;
    });

    // Weak simulation — just to draw links properly
    simulation
      .force("charge", null)
      .force("center", null)
      .force("collide", null)
      .force("x", d3.forceX((d) => (d as DiagramNode).fx ?? width / 2).strength(1))
      .force("y", d3.forceY((d) => (d as DiagramNode).fy ?? height / 2).strength(1))
      .alpha(0.3);
  },
};
