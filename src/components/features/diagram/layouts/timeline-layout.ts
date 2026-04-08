import * as d3 from "d3";
import type { DiagramNode } from "@/lib/diagram/transform";
import type { DiagramLayout } from "./types";

export const timelineLayout: DiagramLayout = {
  name: "timeline",
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
};
