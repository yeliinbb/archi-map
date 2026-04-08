import * as d3 from "d3";
import type { DiagramNode } from "@/lib/diagram/transform";
import type { DiagramLayout } from "./types";

export const timelineLayout: DiagramLayout = {
  name: "timeline",
  linkCurve: "straight",

  apply: ({ simulation, nodes, width, height }) => {
    const years = nodes.filter((n) => n.year).map((n) => n.year!);
    if (years.length === 0) return;

    const timeScale = d3
      .scaleLinear()
      .domain([Math.min(...years), Math.max(...years)])
      .range([100, width - 100]);

    simulation
      .force(
        "x",
        d3
          .forceX((d) => {
            const node = d as DiagramNode;
            return node.year ? timeScale(node.year) : width / 2;
          })
          .strength(0.8),
      )
      .force("y", d3.forceY(height / 2).strength(0.1))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("collide", d3.forceCollide(30));
  },

  // Timeline: vertical ruled lines per decade + year axis at bottom
  renderOverlay: ({ svg, defs, nodes, width, height }) => {
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "var(--background)");

    const years = nodes.filter((n) => n.year).map((n) => n.year!);
    if (years.length === 0) return;

    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const timeScale = d3
      .scaleLinear()
      .domain([minYear, maxYear])
      .range([100, width - 100]);

    // Decade lines
    const startDecade = Math.floor(minYear / 10) * 10;
    const endDecade = Math.ceil(maxYear / 10) * 10;
    const axisGroup = svg.append("g").attr("class", "timeline-axis");

    for (let y = startDecade; y <= endDecade; y += 10) {
      const x = timeScale(y);
      // Vertical ruled line
      axisGroup
        .append("line")
        .attr("x1", x)
        .attr("y1", 40)
        .attr("x2", x)
        .attr("y2", height - 40)
        .attr("stroke", "oklch(0.145 0 0 / 6%)")
        .attr("stroke-width", 0.5);

      // Year label at bottom
      axisGroup
        .append("text")
        .attr("x", x)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .attr("font-family", "var(--font-geist-mono), monospace")
        .attr("font-size", "9px")
        .attr("fill", "oklch(0.145 0 0 / 30%)")
        .text(y);
    }

    // Direction indicator
    axisGroup
      .append("text")
      .attr("x", 16)
      .attr("y", 24)
      .attr("font-family", "var(--font-geist-mono), monospace")
      .attr("font-size", "8px")
      .attr("fill", "oklch(0.145 0 0 / 25%)")
      .attr("letter-spacing", "0.15em")
      .text("YEAR →");
  },
};
