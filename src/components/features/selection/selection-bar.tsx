"use client";

import Link from "next/link";
import { useSelectionStore } from "@/lib/stores/selection-store";

export function SelectionBar() {
  const { selectedBuildingIds } = useSelectionStore();
  const count = selectedBuildingIds.length;

  if (count === 0) return null;

  const diagramUrl = `/diagram?ids=${selectedBuildingIds.join(",")}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <p className="font-mono text-xs text-muted-foreground">
          <span className="text-foreground">{count}</span> building
          {count !== 1 ? "s" : ""} selected
        </p>
        <Link
          href={diagramUrl}
          className={`border border-foreground bg-foreground px-4 py-1.5 font-mono text-micro tracking-wider text-background transition-colors hover:bg-foreground/90 ${
            count < 2 ? "pointer-events-none opacity-40" : ""
          }`}
        >
          View Diagram →
        </Link>
      </div>
    </div>
  );
}
