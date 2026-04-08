"use client";

import { ARCHITECT_COLORS } from "@/lib/architect-colors";
import { useMapFilterStore } from "@/lib/stores/map-filter-store";
import type { Architect } from "@/types";

interface ArchitectLegendProps {
  architects: Architect[];
}

export function ArchitectLegend({ architects }: ArchitectLegendProps) {
  const highlightedArchitectId = useMapFilterStore(
    (s) => s.highlightedArchitectId,
  );
  const toggleHighlightArchitect = useMapFilterStore(
    (s) => s.toggleHighlightArchitect,
  );

  return (
    <div className="absolute bottom-8 left-4 z-10 border border-border bg-background/80 p-3 backdrop-blur-sm">
      <p className="mb-2 font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
        Architects
      </p>
      <div className="space-y-1">
        {architects.map((architect) => {
          const entry = ARCHITECT_COLORS[architect.id];
          if (!entry) return null;
          const isActive =
            !highlightedArchitectId ||
            highlightedArchitectId === architect.id;
          return (
            <button
              key={architect.id}
              type="button"
              onClick={() => toggleHighlightArchitect(architect.id)}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-sm px-1 py-0.5 transition-opacity ${
                isActive ? "opacity-100" : "opacity-30"
              } hover:opacity-100`}
            >
              <span
                className={`h-2 w-2 rounded-full transition-transform ${
                  highlightedArchitectId === architect.id
                    ? "scale-150"
                    : ""
                }`}
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-mono text-micro text-muted-foreground">
                {architect.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
