"use client";

import { ARCHITECT_COLORS } from "@/lib/architect-colors";
import type { Architect } from "@/types";

interface ArchitectLegendProps {
  architects: Architect[];
}

export function ArchitectLegend({ architects }: ArchitectLegendProps) {
  return (
    <div className="absolute bottom-8 left-4 z-10 border border-border bg-background/80 p-3 backdrop-blur-sm">
      <p className="mb-2 font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
        Architects
      </p>
      <div className="space-y-1.5">
        {architects.map((architect) => {
          const entry = ARCHITECT_COLORS[architect.id];
          if (!entry) return null;
          return (
            <div key={architect.id} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-mono text-micro text-muted-foreground">
                {architect.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
