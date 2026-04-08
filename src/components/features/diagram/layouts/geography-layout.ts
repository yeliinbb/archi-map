import * as d3 from "d3";
import type { DiagramNode } from "@/lib/diagram/transform";
import type { DiagramLayout } from "./types";

export const geographyLayout: DiagramLayout = {
  name: "geography",
  linkCurve: "straight",

  apply: ({ simulation, nodes, width, height }) => {
    const lngs = nodes.filter((n) => n.location).map((n) => n.location!.lng);
    const lats = nodes.filter((n) => n.location).map((n) => n.location!.lat);
    if (lngs.length === 0 || lats.length === 0) return;

    const xScale = d3
      .scaleLinear()
      .domain([Math.min(...lngs), Math.max(...lngs)])
      .range([100, width - 100]);
    const yScale = d3
      .scaleLinear()
      .domain([Math.max(...lats), Math.min(...lats)])
      .range([100, height - 100]);

    simulation
      .force(
        "x",
        d3
          .forceX((d) => {
            const node = d as DiagramNode;
            return node.location ? xScale(node.location.lng) : width / 2;
          })
          .strength(0.8),
      )
      .force(
        "y",
        d3
          .forceY((d) => {
            const node = d as DiagramNode;
            return node.location ? yScale(node.location.lat) : height / 2;
          })
          .strength(0.8),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("collide", d3.forceCollide(30));
  },

  // Geography: coordinate grid + axis labels + compass
  renderOverlay: ({ svg, defs, width, height }) => {
    // Grid pattern (40px)
    defs
      .append("pattern")
      .attr("id", "geo-grid")
      .attr("width", 40)
      .attr("height", 40)
      .attr("patternUnits", "userSpaceOnUse")
      .selectAll("line")
      .data([
        { x1: 0, y1: 0, x2: 40, y2: 0 },
        { x1: 0, y1: 0, x2: 0, y2: 40 },
      ])
      .join("line")
      .attr("x1", (d) => d.x1)
      .attr("y1", (d) => d.y1)
      .attr("x2", (d) => d.x2)
      .attr("y2", (d) => d.y2)
      .attr("stroke", "oklch(0.145 0 0 / 5%)")
      .attr("stroke-width", 0.5);

    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#geo-grid)");

    const axisGroup = svg.append("g");

    // Axis labels
    axisGroup
      .append("text")
      .attr("x", 16)
      .attr("y", height / 2)
      .attr("font-family", "var(--font-geist-mono), monospace")
      .attr("font-size", "8px")
      .attr("fill", "oklch(0.145 0 0 / 20%)")
      .attr("letter-spacing", "0.15em")
      .text("N");

    axisGroup
      .append("text")
      .attr("x", 16)
      .attr("y", height - 16)
      .attr("font-family", "var(--font-geist-mono), monospace")
      .attr("font-size", "8px")
      .attr("fill", "oklch(0.145 0 0 / 20%)")
      .attr("letter-spacing", "0.15em")
      .text("S");

    axisGroup
      .append("text")
      .attr("x", 80)
      .attr("y", height - 16)
      .attr("font-family", "var(--font-geist-mono), monospace")
      .attr("font-size", "8px")
      .attr("fill", "oklch(0.145 0 0 / 20%)")
      .attr("letter-spacing", "0.15em")
      .text("W");

    axisGroup
      .append("text")
      .attr("x", width - 30)
      .attr("y", height - 16)
      .attr("font-family", "var(--font-geist-mono), monospace")
      .attr("font-size", "8px")
      .attr("fill", "oklch(0.145 0 0 / 20%)")
      .attr("letter-spacing", "0.15em")
      .text("E");

    // Compass mark (bottom-right)
    const cx = width - 30;
    const cy = 30;
    axisGroup
      .append("line")
      .attr("x1", cx)
      .attr("y1", cy + 10)
      .attr("x2", cx)
      .attr("y2", cy - 10)
      .attr("stroke", "oklch(0.145 0 0 / 25%)")
      .attr("stroke-width", 0.75);
    axisGroup
      .append("text")
      .attr("x", cx)
      .attr("y", cy - 14)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-geist-mono), monospace")
      .attr("font-size", "7px")
      .attr("fill", "oklch(0.145 0 0 / 30%)")
      .text("N");
  },
};
