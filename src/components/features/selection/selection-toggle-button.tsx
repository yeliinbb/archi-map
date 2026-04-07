"use client";

import { useSelectionStore } from "@/lib/stores/selection-store";
import { getArchitectColor } from "@/lib/architect-colors";

interface SelectionToggleButtonProps {
  buildingId: string;
  architectId: string;
}

export function SelectionToggleButton({
  buildingId,
  architectId,
}: SelectionToggleButtonProps) {
  const { isSelected, toggleBuilding, selectedBuildingIds } =
    useSelectionStore();
  const selected = isSelected(buildingId);
  const color = getArchitectColor(architectId);
  const atMax = selectedBuildingIds.length >= 10;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBuilding(buildingId);
      }}
      disabled={!selected && atMax}
      className={`flex h-6 w-6 items-center justify-center border transition-colors ${
        selected
          ? "border-foreground bg-foreground"
          : "border-border hover:border-foreground/50 disabled:opacity-30"
      }`}
      aria-label={selected ? "Remove from selection" : "Add to selection"}
    >
      <span
        className={`block h-2 w-2 rounded-full ${selected ? "" : "opacity-60"}`}
        style={{ backgroundColor: selected ? "var(--background)" : color }}
      />
    </button>
  );
}
