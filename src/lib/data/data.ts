import type { Building, Architect, City, Shop, Event, Tag } from "@/types";
import buildingsData from "./buildings.json";
import architectsData from "./architects.json";
import citiesData from "./cities.json";
import shopsData from "./shops.json";
import eventsData from "./events.json";

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

export function getBuildingById(id: string): Building | undefined {
  return getBuildings().find((b) => b.id === id);
}

export function getBuildingsByIds(ids: string[]): Building[] {
  const buildings = getBuildings();
  return ids
    .map((id) => buildings.find((b) => b.id === id))
    .filter((b): b is Building => b !== undefined);
}

// --- Featured ---

const FEATURED_IDS = [
  "bld-masp",
  "bld-21st-century-museum",
  "bld-serralves-museum",
  "bld-novy-dvur",
];

export function getFeaturedBuildings(): Building[] {
  return getBuildingsByIds(FEATURED_IDS);
}

// --- Related ---

export function getRelatedBuildings(
  building: Building,
  limit = 4
): Building[] {
  const all = getBuildings().filter((b) => b.id !== building.id);
  const scored = all.map((b) => {
    let score = 0;
    if (b.architectId === building.architectId) score += 3;
    if (b.cityId === building.cityId) score += 2;
    if (b.typology && b.typology === building.typology) score += 1;
    const sharedTags = b.tags.filter((t) =>
      building.tags.some((bt) => bt.slug === t.slug)
    );
    score += sharedTags.length;
    return { building: b, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.building);
}

// --- Tags ---

export function getBuildingsByTag(tagSlug: string): Building[] {
  return getBuildings().filter((b) =>
    b.tags.some((t) => t.slug === tagSlug)
  );
}

export function getAllTags(): Tag[] {
  const tagMap = new Map<string, Tag>();
  for (const building of getBuildings()) {
    for (const tag of building.tags) {
      if (!tagMap.has(tag.slug)) {
        tagMap.set(tag.slug, tag);
      }
    }
  }
  return [...tagMap.values()].sort((a, b) => a.label.localeCompare(b.label));
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

// --- Shops ---

export function getShops(): Shop[] {
  return (shopsData as Shop[]).filter((s) => s.status === "published");
}

export function getShopBySlug(slug: string): Shop | undefined {
  return getShops().find((s) => s.slug === slug);
}

export function getShopsByCity(cityId: string): Shop[] {
  return getShops().filter((s) => s.cityId === cityId);
}

// --- Events ---

export function getEvents(): Event[] {
  return (eventsData as Event[]).filter((e) => e.status === "published");
}

export function getEventBySlug(slug: string): Event | undefined {
  return getEvents().find((e) => e.slug === slug);
}

export function getEventsByCity(cityId: string): Event[] {
  return getEvents().filter((e) => e.cityId === cityId);
}
