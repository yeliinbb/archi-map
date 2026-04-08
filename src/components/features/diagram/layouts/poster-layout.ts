import * as d3 from "d3";
import type { DiagramNode } from "@/lib/diagram/transform";
import type { DiagramLayout } from "./types";

export const posterLayout: DiagramLayout = {
  name: "poster",
  linkCurve: "straight",
  linkOpacity: 0.06,

  apply: ({ simulation, nodes, width, height }) => {
    const buildings = nodes.filter((n) => n.type === "building");
    const architects = nodes.filter((n) => n.type === "architect");
    const cities = nodes.filter((n) => n.type === "city");

    const topMargin = height * 0.18;
    const margin = 60;
    const contentH = height - topMargin - margin;
    const contentW = width - margin * 2;

    const cols = Math.min(buildings.length, 3);
    const rows = Math.ceil(buildings.length / cols);
    const cardW = contentW / cols;
    const cardH = (contentH * 0.7) / Math.max(rows, 1);

    buildings.forEach((b, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      b.fx = margin + col * cardW + cardW / 2;
      b.fy = topMargin + row * cardH + cardH / 2;
    });

    const bottomY = height - margin;
    architects.forEach((a, i) => {
      const xStep = (contentW * 0.5) / (architects.length + 1);
      a.fx = margin + (i + 1) * xStep;
      a.fy = bottomY;
    });

    cities.forEach((c, i) => {
      const xStep = (contentW * 0.5) / (cities.length + 1);
      c.fx = width / 2 + (i + 1) * xStep;
      c.fy = bottomY;
    });

    simulation
      .force("charge", null)
      .force("center", null)
      .force("collide", null)
      .force(
        "x",
        d3
          .forceX((d) => (d as DiagramNode).fx ?? width / 2)
          .strength(1),
      )
      .force(
        "y",
        d3
          .forceY((d) => (d as DiagramNode).fy ?? height / 2)
          .strength(1),
      )
      .alpha(0.3);
  },

  // Poster: clean bg + margin frame + large title
  renderOverlay: ({ svg, width, height }) => {
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "var(--background)");

    const m = 32;

    // Single-line margin frame
    svg
      .append("rect")
      .attr("x", m)
      .attr("y", m)
      .attr("width", width - m * 2)
      .attr("height", height - m * 2)
      .attr("fill", "none")
      .attr("stroke", "oklch(0.145 0 0 / 8%)")
      .attr("stroke-width", 0.75);

    // Large title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", m + 40)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-geist-mono), monospace")
      .attr("font-size", "18px")
      .attr("font-weight", "300")
      .attr("fill", "oklch(0.145 0 0 / 20%)")
      .attr("letter-spacing", "0.3em")
      .text("CURATED SELECTION");

    // Subtitle line
    svg
      .append("line")
      .attr("x1", width / 2 - 60)
      .attr("y1", m + 52)
      .attr("x2", width / 2 + 60)
      .attr("y2", m + 52)
      .attr("stroke", "oklch(0.145 0 0 / 10%)")
      .attr("stroke-width", 0.5);

    // Bottom watermark
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - m + 16)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-geist-mono), monospace")
      .attr("font-size", "7px")
      .attr("fill", "oklch(0.145 0 0 / 15%)")
      .attr("letter-spacing", "0.2em")
      .text("ARCHI CURATION");
  },
};
