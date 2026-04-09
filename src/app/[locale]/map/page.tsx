import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { getBuildings, getArchitects, getCities, getAllTags } from "@/lib/data/data";
import { ArchitectLegend, SelectionSidebar, MapFilters } from "@/components/features/map";

const MapView = dynamic(
  () => import("@/components/features/map/MapView").then((m) => m.MapView),
);

export const metadata: Metadata = {
  title: "Map",
};

export default function MapPage() {
  const buildings = getBuildings();
  const architects = getArchitects();
  const cities = getCities();
  const allTags = getAllTags();

  const buildingCounts: Record<string, number> = {};
  for (const b of buildings) {
    buildingCounts[b.architectId] = (buildingCounts[b.architectId] ?? 0) + 1;
  }

  return (
    <div className="relative h-[calc(100dvh-3.5rem)]">
      <MapView buildings={buildings} architects={architects} />
      <Suspense>
        <MapFilters cities={cities} tags={allTags} />
      </Suspense>
      <ArchitectLegend architects={architects} buildingCounts={buildingCounts} />
      <SelectionSidebar buildings={buildings} />
    </div>
  );
}
