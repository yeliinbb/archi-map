import dynamic from "next/dynamic";
import type { Metadata } from "next";
import {
  getBuildingsByIds,
  getArchitectById,
  getCityById,
} from "@/lib/data/data";
import { DiagramEmpty } from "@/components/features/diagram";
import type { Architect, City } from "@/types";

const DiagramView = dynamic(
  () => import("@/components/features/diagram/DiagramView").then((m) => m.DiagramView),
);

export const metadata: Metadata = {
  title: "Diagram",
};

interface Props {
  searchParams: Promise<{ ids?: string }>;
}

export default async function DiagramPage({ searchParams }: Props) {
  const { ids } = await searchParams;

  if (!ids) {
    return (
      <div className="h-[calc(100dvh-3.5rem)]">
        <DiagramEmpty />
      </div>
    );
  }

  const buildingIds = ids.split(",").filter(Boolean);
  const buildings = getBuildingsByIds(buildingIds);

  if (buildings.length === 0) {
    return (
      <div className="h-[calc(100dvh-3.5rem)]">
        <DiagramEmpty />
      </div>
    );
  }

  // Collect unique related architects and cities
  const architectIds = [...new Set(buildings.map((b) => b.architectId))];
  const cityIds = [...new Set(buildings.map((b) => b.cityId))];

  const architects = architectIds
    .map((id) => getArchitectById(id))
    .filter((a): a is Architect => a !== undefined);

  const cities = cityIds
    .map((id) => getCityById(id))
    .filter((c): c is City => c !== undefined);

  return (
    <div className="h-[calc(100dvh-3.5rem)]">
      <DiagramView
        buildings={buildings}
        architects={architects}
        cities={cities}
      />
    </div>
  );
}
