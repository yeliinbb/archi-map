import { Suspense } from "react";
import type { Metadata } from "next";
import { getBuildings, getArchitects, getCities, getAllTags } from "@/lib/data/data";
import { MapView } from "@/components/features/map/map-view";
import { ArchitectLegend } from "@/components/features/map/architect-legend";
import { SelectionSidebar } from "@/components/features/map/selection-sidebar";
import { MapFilters } from "@/components/features/map/map-filters";

export const metadata: Metadata = {
  title: "Map",
};

export default function MapPage() {
  const buildings = getBuildings();
  const architects = getArchitects();
  const cities = getCities();
  const allTags = getAllTags();

  return (
    <div className="relative h-[calc(100vh-3.5rem)]">
      <MapView buildings={buildings} architects={architects} />
      <Suspense>
        <MapFilters cities={cities} tags={allTags} />
      </Suspense>
      <ArchitectLegend architects={architects} />
      <SelectionSidebar buildings={buildings} />
    </div>
  );
}
