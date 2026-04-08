"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import type { DiagramNode, DiagramLink, DiagramGraph } from "@/lib/diagram/transform";
import { LAYOUTS, type LayoutMode } from "./layouts";

interface NetworkDiagramProps {
  graph: DiagramGraph;
  layout: LayoutMode;
  width: number;
  height: number;
  showLabels?: boolean;
}

const NODE_RADIUS = {
  building: 16,
  architect: 12,
  city: 10,
};

export function NetworkDiagram({
  graph,
  layout,
  width,
  height,
  showLabels = true,
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
      source: typeof l.source === "string" ? l.source : l.source.id,
      target: typeof l.target === "string" ? l.target : l.target.id,
    }));

    // Layout plugin
    const defs = svg.append("defs");
    const layoutPlugin = LAYOUTS[layout];

    // Background/overlay — delegated to layout plugin
    if (layoutPlugin?.renderOverlay) {
      layoutPlugin.renderOverlay({ svg, g: svg.append("g"), defs, nodes, width, height });
    } else {
      // Default: plain background
      svg
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "var(--background)");
    }

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
          }),
      );

    // Apply layout forces via plugin
    if (layoutPlugin) {
      layoutPlugin.apply({ simulation, nodes, links, width, height });
    }

    // Links — mode-aware styling
    const linkCurve = layoutPlugin?.linkCurve ?? "straight";
    const linkBaseOpacity = layoutPlugin?.linkOpacity ?? 1;

    const linkGroup = g
      .append("g")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", (d) => {
        const link = d as unknown as DiagramLink;
        const alpha = linkBaseOpacity;
        if (link.type === "same-architect") return `oklch(0.5 0 0 / ${12 * alpha}%)`;
        if (link.type === "city-building") return `oklch(0.5 0 0 / ${20 * alpha}%)`;
        return `oklch(0.5 0 0 / ${30 * alpha}%)`;
      })
      .attr("stroke-width", (d) => {
        const link = d as unknown as DiagramLink;
        return link.type === "same-architect" ? 0.5 : 1;
      })
      .attr("stroke-dasharray", (d) => {
        const link = d as unknown as DiagramLink;
        return link.type === "same-architect" ? "3 3" : "none";
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

    (
      nodeGroup as d3.Selection<
        SVGGElement,
        DiagramNode,
        SVGGElement,
        unknown
      >
    ).call(drag);

    // Draw node shapes — polished
    nodeGroup.each(function (d) {
      const el = d3.select(this);
      const r = NODE_RADIUS[d.type];

      if (d.type === "building") {
        el.append("circle")
          .attr("r", r)
          .attr("fill", d.color)
          .attr("stroke", "var(--background)")
          .attr("stroke-width", 2)
          .attr("opacity", 0.9);
      } else if (d.type === "architect") {
        el.append("rect")
          .attr("x", -r)
          .attr("y", -r)
          .attr("width", r * 2)
          .attr("height", r * 2)
          .attr("rx", 3)
          .attr("fill", d.color)
          .attr("stroke", "var(--background)")
          .attr("stroke-width", 2)
          .attr("opacity", 0.9);
      } else {
        const triPath = d3.symbol().type(d3.symbolTriangle).size(r * r * 2);
        el.append("path")
          .attr("d", triPath)
          .attr("fill", d.color)
          .attr("stroke", "var(--background)")
          .attr("stroke-width", 2)
          .attr("opacity", 0.9);
      }
    });

    // Labels — conditional on showLabels
    if (showLabels) {
      nodeGroup.each(function (d) {
        const el = d3.select(this);
        const r = NODE_RADIUS[d.type];
        const labelY = r + 14;

        const textNode = el
          .append("text")
          .text(d.label)
          .attr("dy", labelY)
          .attr("text-anchor", "middle")
          .attr("font-family", "var(--font-geist-mono), monospace")
          .attr("font-size", "9px")
          .attr("fill", "var(--foreground)")
          .attr("opacity", 0.8);

        const bbox = (textNode.node() as SVGTextElement)?.getBBox();
        if (bbox) {
          el.insert("rect", "text")
            .attr("x", bbox.x - 2)
            .attr("y", bbox.y - 1)
            .attr("width", bbox.width + 4)
            .attr("height", bbox.height + 2)
            .attr("fill", "var(--background)")
            .attr("opacity", 0.7);
        }
      });
    }

    // Hover events
    nodeGroup
      .on("mouseenter", (event, d) => {
        const [x, y] = d3.pointer(event, svgRef.current);
        setTooltip({ node: d, x, y });
      })
      .on("mouseleave", () => {
        setTooltip(null);
      });

    // Link path generator based on mode
    const linkPath = (d: unknown) => {
      const link = d as unknown as DiagramLink;
      const s = link.source as unknown as DiagramNode;
      const t = link.target as unknown as DiagramNode;
      const sx = s.x ?? 0;
      const sy = s.y ?? 0;
      const tx = t.x ?? 0;
      const ty = t.y ?? 0;

      if (linkCurve === "arc") {
        const dx = tx - sx;
        const dy = ty - sy;
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.8;
        return `M${sx},${sy}A${dr},${dr} 0 0,1 ${tx},${ty}`;
      }
      if (linkCurve === "orthogonal") {
        const mx = (sx + tx) / 2;
        return `M${sx},${sy}L${mx},${sy}L${mx},${ty}L${tx},${ty}`;
      }
      return `M${sx},${sy}L${tx},${ty}`;
    };

    // Tick
    simulation.on("tick", () => {
      linkGroup.attr("d", linkPath);

      nodeGroup.attr(
        "transform",
        (d) => `translate(${d.x ?? 0},${d.y ?? 0})`,
      );
    });

    return () => {
      simulation.stop();
    };
  }, [graph, layout, width, height, showLabels]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-background"
      />
      {tooltip ? (
        <div
          className="pointer-events-none absolute z-20 border border-border bg-background p-3"
          style={{
            left: tooltip.x + 16,
            top: tooltip.y - 8,
          }}
        >
          <p className="font-mono text-micro tracking-wider text-muted-foreground uppercase">
            {tooltip.node.type}
          </p>
          <p className="font-mono text-xs font-medium">
            {tooltip.node.label}
          </p>
          {tooltip.node.labelKo ? (
            <p className="font-mono text-micro text-muted-foreground">
              {tooltip.node.labelKo}
            </p>
          ) : null}
          {tooltip.node.year ? (
            <p className="font-mono text-micro text-muted-foreground">
              {tooltip.node.year}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="absolute bottom-3 right-3 font-mono text-[9px] text-muted-foreground/40">
        Archi Curation
      </div>
    </div>
  );
}
