"use client";

import { Popup } from "react-map-gl/maplibre";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSelectionStore } from "@/lib/stores/selection-store";
import { OptimizedImage } from "@/components/shared/optimized-image";
import { getArchitectColor } from "@/lib/architect-colors";
import type { Building, Architect } from "@/types";

interface BuildingPopupProps {
  building: Building;
  architect?: Architect;
  onClose: () => void;
}

export function BuildingPopup({
  building,
  architect,
  onClose,
}: BuildingPopupProps) {
  const t = useTranslations("selection");
  const { isSelected, toggleBuilding, selectedBuildingIds } =
    useSelectionStore();
  const selected = isSelected(building.id);
  const color = getArchitectColor(building.architectId);

  return (
    <Popup
      longitude={building.location.lng}
      latitude={building.location.lat}
      anchor="bottom"
      closeOnClick={false}
      onClose={onClose}
      maxWidth="240px"
    >
      <div className="w-[240px]">
        {building.images[0]?.src ? (
          <div className="h-[120px]">
            <OptimizedImage
              src={building.images[0].src}
              alt={building.images[0].alt}
              fill
              sizes="240px"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="p-3">
          <div className="mb-1 flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-micro text-muted-foreground">
              {building.year}
            </span>
          </div>
          <h3 className="mb-0.5 font-mono text-sm leading-tight tracking-wide">
            {building.name}
          </h3>
          {architect ? (
            <p className="mb-3 font-mono text-micro text-muted-foreground">
              {architect.name}
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleBuilding(building.id)}
              disabled={
                !selected && selectedBuildingIds.length >= 10
              }
              className={`flex-1 border px-2 py-1 font-mono text-micro tracking-wider transition-colors ${
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-accent disabled:opacity-40"
              }`}
            >
              {selected ? t("selected") : t("select")}
            </button>
            <Link
              href={`/map/buildings/${building.slug}`}
              className="border border-border px-2 py-1 font-mono text-micro tracking-wider transition-colors hover:bg-accent"
            >
              {t("details")}
            </Link>
          </div>
        </div>
      </div>
    </Popup>
  );
}
