"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useSelectionStore } from "@/lib/stores/selection-store";
import { getArchitectColor } from "@/lib/architect-colors";
import type { Building } from "@/types";

interface SelectionSidebarProps {
  buildings: Building[];
}

export function SelectionSidebar({ buildings }: SelectionSidebarProps) {
  const { selectedBuildingIds, removeBuilding, clearSelection } =
    useSelectionStore();

  if (selectedBuildingIds.length === 0) return null;

  const selectedBuildings = selectedBuildingIds
    .map((id) => buildings.find((b) => b.id === id))
    .filter((b): b is Building => b !== undefined);

  const diagramUrl = `/diagram?ids=${selectedBuildingIds.join(",")}`;

  return (
    <div className="absolute right-0 top-0 z-10 flex h-full w-72 flex-col border-l border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <p className="font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
            Selection
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {selectedBuildingIds.length}/10
          </p>
        </div>
        <button
          type="button"
          onClick={clearSelection}
          className="font-mono text-micro text-muted-foreground transition-colors hover:text-foreground"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedBuildings.map((building) => (
          <div
            key={building.id}
            className="flex items-center gap-3 border-b border-border px-4 py-3"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor: getArchitectColor(building.architectId),
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-xs">{building.name}</p>
              <p className="font-mono text-micro text-muted-foreground">
                {building.year}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeBuilding(building.id)}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-4">
        <Link
          href={diagramUrl}
          className={`block w-full border border-foreground bg-foreground px-4 py-2 text-center font-mono text-xs tracking-wider text-background transition-colors hover:bg-foreground/90 ${
            selectedBuildingIds.length < 2
              ? "pointer-events-none opacity-40"
              : ""
          }`}
        >
          Generate Diagram →
        </Link>
        {selectedBuildingIds.length < 2 && (
          <p className="mt-2 text-center font-mono text-micro text-muted-foreground">
            Select at least 2 buildings
          </p>
        )}
      </div>
    </div>
  );
}
