import * as d3 from "d3";
import type { DiagramNode } from "@/lib/diagram/transform";
import type { DiagramLayout } from "./types";

export const blueprintLayout: DiagramLayout = {
  name: "blueprint",
  linkCurve: "orthogonal",
  linkOpacity: 0.2,

  apply: ({ simulation, nodes, width, height }) => {
    const buildings = nodes.filter((n) => n.type === "building");
    const architects = nodes.filter((n) => n.type === "architect");
    const cities = nodes.filter((n) => n.type === "city");

    const margin = 80;
    const gridW = width - margin * 2;
    const gridH = height - margin * 2;

    const cols = Math.ceil(Math.sqrt(buildings.length * 1.5));
    const rows = Math.ceil(buildings.length / cols);
    const cellW = gridW / (cols + 2);
    const cellH = gridH / Math.max(rows, 1);

    buildings.forEach((b, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      b.fx = margin + cellW + col * cellW + cellW / 2;
      b.fy = margin + row * cellH + cellH / 2;
    });

    architects.forEach((a, i) => {
      const yStep = gridH / (architects.length + 1);
      a.fx = margin + cellW / 2;
      a.fy = margin + (i + 1) * yStep;
    });

    cities.forEach((c, i) => {
      const yStep = gridH / (cities.length + 1);
      c.fx = width - margin - cellW / 2;
      c.fy = margin + (i + 1) * yStep;
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

  // Blueprint: dense grid + double-line frame + title block
  renderOverlay: ({ svg, defs, width, height }) => {
    // Dense grid (20px) with major lines every 4th
    const gridGroup = svg.append("g").attr("class", "blueprint-grid");

    for (let x = 0; x <= width; x += 20) {
      const isMajor = x % 80 === 0;
      gridGroup
        .append("line")
        .attr("x1", x)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", height)
        .attr("stroke", isMajor ? "oklch(0.145 0 0 / 7%)" : "oklch(0.145 0 0 / 3%)")
        .attr("stroke-width", isMajor ? 0.75 : 0.5);
    }
    for (let y = 0; y <= height; y += 20) {
      const isMajor = y % 80 === 0;
      gridGroup
        .append("line")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", width)
        .attr("y2", y)
        .attr("stroke", isMajor ? "oklch(0.145 0 0 / 7%)" : "oklch(0.145 0 0 / 3%)")
        .attr("stroke-width", isMajor ? 0.75 : 0.5);
    }

    // Double-line frame
    const m = 24;
    const frameGroup = svg.append("g").attr("class", "blueprint-frame");
    // Outer frame
    frameGroup
      .append("rect")
      .attr("x", m)
      .attr("y", m)
      .attr("width", width - m * 2)
      .attr("height", height - m * 2)
      .attr("fill", "none")
      .attr("stroke", "oklch(0.145 0 0 / 15%)")
      .attr("stroke-width", 1.5);
    // Inner frame
    frameGroup
      .append("rect")
      .attr("x", m + 4)
      .attr("y", m + 4)
      .attr("width", width - m * 2 - 8)
      .attr("height", height - m * 2 - 8)
      .attr("fill", "none")
      .attr("stroke", "oklch(0.145 0 0 / 10%)")
      .attr("stroke-width", 0.5);

    // Title block (bottom-right)
    const tbW = 180;
    const tbH = 48;
    const tbX = width - m - tbW;
    const tbY = height - m - tbH;

    frameGroup
      .append("rect")
      .attr("x", tbX)
      .attr("y", tbY)
      .attr("width", tbW)
      .attr("height", tbH)
      .attr("fill", "var(--background)")
      .attr("stroke", "oklch(0.145 0 0 / 15%)")
      .attr("stroke-width", 1);

    frameGroup
      .append("text")
      .attr("x", tbX + 8)
      .attr("y", tbY + 18)
      .attr("font-family", "var(--font-geist-mono), monospace")
      .attr("font-size", "9px")
      .attr("fill", "oklch(0.145 0 0 / 40%)")
      .attr("letter-spacing", "0.2em")
      .text("ARCHI CURATION");

    frameGroup
      .append("text")
      .attr("x", tbX + 8)
      .attr("y", tbY + 34)
      .attr("font-family", "var(--font-geist-mono), monospace")
      .attr("font-size", "7px")
      .attr("fill", "oklch(0.145 0 0 / 25%)")
      .text(`BLUEPRINT — ${new Date().toISOString().slice(0, 10)}`);
  },
};
