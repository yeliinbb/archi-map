import * as d3 from "d3";
import type { DiagramLayout } from "./types";

export const forceLayout: DiagramLayout = {
  name: "force",
  apply: ({ simulation, width, height }) => {
    simulation
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("collide", d3.forceCollide(30));
  },
};
