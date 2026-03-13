import type { Building, Architect, City } from "@/types";
import buildingsData from "./buildings.json";
import architectsData from "./architects.json";
import citiesData from "./cities.json";

// --- Buildings ---

export function getBuildings(): Building[] {
  return (buildingsData as Building[]).filter((b) => b.status === "published");
}

export function getBuildingBySlug(slug: string): Building | undefined {
  return getBuildings().find((b) => b.slug === slug);
}

export function getBuildingsByCity(cityId: string): Building[] {
  return getBuildings().filter((b) => b.cityId === cityId);
}

export function getBuildingsByArchitect(architectId: string): Building[] {
  return getBuildings().filter((b) => b.architectId === architectId);
}

// --- Architects ---

export function getArchitects(): Architect[] {
  return (architectsData as Architect[]).filter(
    (a) => a.status === "published"
  );
}

export function getArchitectBySlug(slug: string): Architect | undefined {
  return getArchitects().find((a) => a.slug === slug);
}

export function getArchitectById(id: string): Architect | undefined {
  return getArchitects().find((a) => a.id === id);
}

// --- Cities ---

export function getCities(): City[] {
  return (citiesData as City[]).filter((c) => c.status === "published");
}

export function getCityBySlug(slug: string): City | undefined {
  return getCities().find((c) => c.slug === slug);
}

export function getCityById(id: string): City | undefined {
  return getCities().find((c) => c.id === id);
}
