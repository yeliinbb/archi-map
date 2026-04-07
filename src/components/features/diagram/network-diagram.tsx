"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import type { DiagramNode, DiagramLink, DiagramGraph } from "@/lib/diagram/transform";
import type { LayoutMode } from "./layout-controls";

interface NetworkDiagramProps {
  graph: DiagramGraph;
  layout: LayoutMode;
  width: number;
  height: number;
}

const NODE_RADIUS = {
  building: 18,
  architect: 14,
  city: 12,
};

export function NetworkDiagram({
  graph,
  layout,
  width,
  height,
}: NetworkDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    node: DiagramNode;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current || width === 0 || height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Deep copy for d3 mutation
    const nodes: DiagramNode[] = graph.nodes.map((n) => ({ ...n }));
    const links: DiagramLink[] = graph.links.map((l) => ({
      ...l,
      source:
        typeof l.source === "string" ? l.source : l.source.id,
      target:
        typeof l.target === "string" ? l.target : l.target.id,
    }));

    // Grid pattern
    const defs = svg.append("defs");
    defs
      .append("pattern")
      .attr("id", "grid")
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
      .attr("stroke-width", 1);

    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#grid)");

    // Container for zoom
    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(links as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[])
          .id((d) => (d as DiagramNode).id)
          .distance((l) => {
            const link = l as unknown as DiagramLink;
            return link.type === "same-architect" ? 60 : 100;
          })
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(30));

    // Apply layout-specific forces
    if (layout === "timeline") {
      const years = nodes
        .filter((n) => n.year)
        .map((n) => n.year!);
      if (years.length > 0) {
        const timeScale = d3
          .scaleLinear()
          .domain([Math.min(...years), Math.max(...years)])
          .range([100, width - 100]);
        simulation.force(
          "x",
          d3
            .forceX((d) => {
              const node = d as DiagramNode;
              if (node.year) return timeScale(node.year);
              // Position architects/cities at centroid of their buildings
              return width / 2;
            })
            .strength(0.8)
        );
        simulation.force(
          "y",
          d3.forceY(height / 2).strength(0.1)
        );
      }
    } else if (layout === "geography") {
      const lngs = nodes
        .filter((n) => n.location)
        .map((n) => n.location!.lng);
      const lats = nodes
        .filter((n) => n.location)
        .map((n) => n.location!.lat);
      if (lngs.length > 0 && lats.length > 0) {
        const xScale = d3
          .scaleLinear()
          .domain([Math.min(...lngs), Math.max(...lngs)])
          .range([100, width - 100]);
        const yScale = d3
          .scaleLinear()
          .domain([Math.max(...lats), Math.min(...lats)])
          .range([100, height - 100]);
        simulation.force(
          "x",
          d3
            .forceX((d) => {
              const node = d as DiagramNode;
              return node.location ? xScale(node.location.lng) : width / 2;
            })
            .strength(0.8)
        );
        simulation.force(
          "y",
          d3
            .forceY((d) => {
              const node = d as DiagramNode;
              return node.location ? yScale(node.location.lat) : height / 2;
            })
            .strength(0.8)
        );
      }
    }

    // Links
    const linkGroup = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d) => {
        const link = d as unknown as DiagramLink;
        return link.type === "same-architect"
          ? "oklch(0.5 0 0 / 15%)"
          : "oklch(0.5 0 0 / 30%)";
      })
      .attr("stroke-width", (d) => {
        const link = d as unknown as DiagramLink;
        return link.type === "same-architect" ? 0.5 : 1;
      })
      .attr("stroke-dasharray", (d) => {
        const link = d as unknown as DiagramLink;
        return link.type === "same-architect" ? "4 4" : "none";
      });

    // Nodes group
    const nodeGroup = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer");

    // Drag behavior
    const drag = d3
      .drag<SVGGElement, DiagramNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    (nodeGroup as d3.Selection<SVGGElement, DiagramNode, SVGGElement, unknown>).call(drag);

    // Draw node shapes
    nodeGroup.each(function (d) {
      const el = d3.select(this);
      const r = NODE_RADIUS[d.type];

      if (d.type === "building") {
        // Circle for buildings
        el.append("circle")
          .attr("r", r)
          .attr("fill", d.color)
          .attr("stroke", "var(--background)")
          .attr("stroke-width", 2);
      } else if (d.type === "architect") {
        // Rounded rect for architects
        el.append("rect")
          .attr("x", -r)
          .attr("y", -r)
          .attr("width", r * 2)
          .attr("height", r * 2)
          .attr("rx", 3)
          .attr("fill", d.color)
          .attr("stroke", "var(--background)")
          .attr("stroke-width", 2);
      } else {
        // Triangle for cities
        const triPath = d3.symbol().type(d3.symbolTriangle).size(r * r * 2);
        el.append("path")
          .attr("d", triPath)
          .attr("fill", d.color)
          .attr("stroke", "var(--background)")
          .attr("stroke-width", 2);
      }
    });

    // Labels
    nodeGroup
      .append("text")
      .text((d) => d.label)
      .attr("dy", (d) => NODE_RADIUS[d.type] + 14)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-geist-mono), monospace")
      .attr("font-size", "9px")
      .attr("fill", "var(--foreground)")
      .attr("opacity", 0.7);

    // Hover events
    nodeGroup
      .on("mouseenter", (event, d) => {
        const [x, y] = d3.pointer(event, svgRef.current);
        setTooltip({ node: d, x, y });
      })
      .on("mouseleave", () => {
        setTooltip(null);
      });

    // Tick
    simulation.on("tick", () => {
      linkGroup
        .attr("x1", (d) => ((d.source as unknown as DiagramNode).x ?? 0))
        .attr("y1", (d) => ((d.source as unknown as DiagramNode).y ?? 0))
        .attr("x2", (d) => ((d.target as unknown as DiagramNode).x ?? 0))
        .attr("y2", (d) => ((d.target as unknown as DiagramNode).y ?? 0));

      nodeGroup.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graph, layout, width, height]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-background"
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 border border-border bg-background p-3 shadow-sm"
          style={{
            left: tooltip.x + 16,
            top: tooltip.y - 8,
          }}
        >
          <p className="font-mono text-micro tracking-wider text-muted-foreground uppercase">
            {tooltip.node.type}
          </p>
          <p className="font-mono text-xs font-medium">{tooltip.node.label}</p>
          {tooltip.node.labelKo && (
            <p className="font-mono text-micro text-muted-foreground">
              {tooltip.node.labelKo}
            </p>
          )}
          {tooltip.node.year && (
            <p className="font-mono text-micro text-muted-foreground">
              {tooltip.node.year}
            </p>
          )}
        </div>
      )}

      {/* Watermark for export */}
      <div className="absolute bottom-3 right-3 font-mono text-[9px] text-muted-foreground/40">
        Archi Curation
      </div>
    </div>
  );
}
