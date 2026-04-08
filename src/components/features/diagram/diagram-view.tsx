"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { NetworkDiagram } from "./network-diagram";
import { LayoutControls, type LayoutMode } from "./layout-controls";
import { ExportButton } from "./export-button";
import { buildDiagramGraph } from "@/lib/diagram/transform";
import type { Building, Architect, City } from "@/types";

interface DiagramViewProps {
  buildings: Building[];
  architects: Architect[];
  cities: City[];
}

export function DiagramView({
  buildings,
  architects,
  cities,
}: DiagramViewProps) {
  const t = useTranslations("diagram");
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<LayoutMode>("force");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const graph = useMemo(
    () => buildDiagramGraph(buildings, architects, cities),
    [buildings, architects, cities]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2 border-b border-border px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
            {t("title")}
          </p>
          <span className="hidden font-mono text-micro text-muted-foreground sm:inline">
            {t("stats", {
              buildings: buildings.length,
              architects: architects.length,
              cities: cities.length,
            })}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LayoutControls current={layout} onChange={setLayout} />
          <ExportButton targetRef={containerRef} />
        </div>
      </div>
      <div ref={containerRef} className="flex-1">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <NetworkDiagram
            graph={graph}
            layout={layout}
            width={dimensions.width}
            height={dimensions.height}
          />
        )}
      </div>
    </div>
  );
}
