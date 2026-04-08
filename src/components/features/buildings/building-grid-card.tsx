"use client";

import { Link } from "@/i18n/navigation";
import { SelectionToggleButton } from "@/components/features/selection/selection-toggle-button";
import { OptimizedImage } from "@/components/shared/optimized-image";
import { getArchitectColor } from "@/lib/architect-colors";
import type { Building, Architect } from "@/types";

interface BuildingGridCardProps {
  building: Building;
  architect?: Architect;
}

export function BuildingGridCard({
  building,
  architect,
}: BuildingGridCardProps) {
  const color = getArchitectColor(building.architectId);

  return (
    <div className="group relative border border-border bg-background transition-colors hover:bg-accent">
      <Link href={`/map/buildings/${building.slug}`}>
        {building.images[0]?.src ? (
          <OptimizedImage
            src={building.images[0].src}
            alt={building.images[0].alt}
            fill
            aspectRatio="4/3"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex aspect-[4/3] items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <span
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
        )}
        <div className="p-3">
          <div className="mb-1 flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-micro text-muted-foreground">
              {building.year}
            </span>
          </div>
          <h3 className="mb-1 truncate font-mono text-xs tracking-wide">
            {building.name}
          </h3>
          {architect ? (
            <p className="truncate font-mono text-micro text-muted-foreground">
              {architect.name}
            </p>
          ) : null}
        </div>
      </Link>
      <div className="absolute right-2 top-2">
        <SelectionToggleButton
          buildingId={building.id}
          architectId={building.architectId}
        />
      </div>
    </div>
  );
}
