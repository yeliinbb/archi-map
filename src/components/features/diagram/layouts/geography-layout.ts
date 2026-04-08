import * as d3 from "d3";
import type { DiagramNode } from "@/lib/diagram/transform";
import type { DiagramLayout } from "./types";

export const geographyLayout: DiagramLayout = {
  name: "geography",
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
};
