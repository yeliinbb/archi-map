import type { Building } from "@/types";
import { getArchitectHex } from "@/lib/architect-colors";

export type BuildingFeatureProperties = {
  id: string;
  name: string;
  slug: string;
  architectId: string;
  architectColor: string;
  cityId: string;
  year: number;
};

export const buildingsToFeatureCollection = (
  buildings: Building[],
): GeoJSON.FeatureCollection<GeoJSON.Point> => ({
  type: "FeatureCollection",
  features: buildings.map((b) => ({
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [b.location.lng, b.location.lat],
    },
    properties: {
      id: b.id,
      name: b.name,
      slug: b.slug,
      architectId: b.architectId,
      architectColor: getArchitectHex(b.architectId),
      cityId: b.cityId,
      year: b.year,
    },
  })),
});
