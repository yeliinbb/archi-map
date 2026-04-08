"use client";

import { Marker } from "react-map-gl/maplibre";
import { getArchitectColor } from "@/lib/architect-colors";
import { useSelectionStore } from "@/lib/stores/selection-store";
import type { Building } from "@/types";

interface BuildingMarkerProps {
  building: Building;
  onClick: (building: Building) => void;
}

export function BuildingMarker({ building, onClick }: BuildingMarkerProps) {
  const isSelected = useSelectionStore((s) =>
    s.selectedBuildingIds.includes(building.id)
  );
  const color = getArchitectColor(building.architectId);

  return (
    <Marker
      longitude={building.location.lng}
      latitude={building.location.lat}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(building);
      }}
    >
      <button
        type="button"
        className="group relative flex items-center justify-center"
        aria-label={building.name}
      >
        {isSelected && (
          <span
            className="absolute h-5 w-5 animate-ping rounded-full opacity-30"
            style={{ backgroundColor: color }}
          />
        )}
        <span
          className={`relative block rounded-full border-2 border-background shadow-sm transition-transform group-hover:scale-125 ${
            isSelected ? "h-3.5 w-3.5" : "h-2.5 w-2.5"
          }`}
          style={{ backgroundColor: color }}
        />
      </button>
    </Marker>
  );
}
