import type { Metadata } from "next";
import { getBuildings, getArchitects } from "@/lib/data/data";
import { MapView } from "@/components/features/map/map-view";
import { ArchitectLegend } from "@/components/features/map/architect-legend";
import { SelectionSidebar } from "@/components/features/map/selection-sidebar";

export const metadata: Metadata = {
  title: "Map",
};

export default function MapPage() {
  const buildings = getBuildings();
  const architects = getArchitects();

  return (
    <div className="relative h-[calc(100vh-3.5rem)]">
      <MapView buildings={buildings} architects={architects} />
      <ArchitectLegend architects={architects} />
      <SelectionSidebar buildings={buildings} />
    </div>
  );
}
