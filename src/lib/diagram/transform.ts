import type { Building, Architect, City, GeoLocation } from "@/types";
import { getArchitectColor } from "@/lib/architect-colors";

export interface DiagramNode {
  id: string;
  type: "building" | "architect" | "city";
  label: string;
  labelKo?: string;
  color: string;
  imageSrc?: string;
  year?: number;
  location?: GeoLocation;
  // d3 simulation properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface DiagramLink {
  source: string | DiagramNode;
  target: string | DiagramNode;
  type: "architect-building" | "city-building" | "same-architect";
}

export interface DiagramGraph {
  nodes: DiagramNode[];
  links: DiagramLink[];
}

export function buildDiagramGraph(
  buildings: Building[],
  architects: Architect[],
  cities: City[]
): DiagramGraph {
  const nodes: DiagramNode[] = [];
  const links: DiagramLink[] = [];

  // Collect unique related entities
  const architectIds = new Set(buildings.map((b) => b.architectId));
  const cityIds = new Set(buildings.map((b) => b.cityId));

  // Building nodes
  for (const building of buildings) {
    nodes.push({
      id: building.id,
      type: "building",
      label: building.name,
      labelKo: building.nameKo,
      color: getArchitectColor(building.architectId),
      imageSrc: building.images[0]?.src,
      year: building.year,
      location: building.location,
    });
  }

  // Architect nodes
  for (const architect of architects) {
    if (!architectIds.has(architect.id)) continue;
    nodes.push({
      id: architect.id,
      type: "architect",
      label: architect.name,
      labelKo: architect.nameKo,
      color: getArchitectColor(architect.id),
    });
  }

  // City nodes
  for (const city of cities) {
    if (!cityIds.has(city.id)) continue;
    nodes.push({
      id: city.id,
      type: "city",
      label: city.name,
      labelKo: city.nameKo,
      color: "oklch(0.5 0 0)",
      location: city.location,
    });
  }

  // Building ↔ Architect links
  for (const building of buildings) {
    links.push({
      source: building.id,
      target: building.architectId,
      type: "architect-building",
    });
  }

  // Building ↔ City links
  for (const building of buildings) {
    links.push({
      source: building.id,
      target: building.cityId,
      type: "city-building",
    });
  }

  // Same-architect building links
  const byArchitect = new Map<string, string[]>();
  for (const building of buildings) {
    const list = byArchitect.get(building.architectId) ?? [];
    list.push(building.id);
    byArchitect.set(building.architectId, list);
  }
  for (const [, ids] of byArchitect) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        links.push({
          source: ids[i],
          target: ids[j],
          type: "same-architect",
        });
      }
    }
  }

  return { nodes, links };
}
