import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBuildingBySlug,
  getBuildings,
  getArchitectById,
  getCityById,
} from "@/lib/data/data";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getBuildings().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const building = getBuildingBySlug(slug);
  if (!building) return { title: "Not Found" };
  return { title: building.name };
}

export default async function BuildingDetailPage({ params }: Props) {
  const { slug } = await params;
  const building = getBuildingBySlug(slug);
  if (!building) notFound();

  const architect = getArchitectById(building.architectId);
  const city = getCityById(building.cityId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <Link
        href="/map/buildings"
        className="mb-8 inline-block font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Buildings
      </Link>

      <div className="mb-3 flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {building.year}
        </span>
        {building.typology && (
          <Badge
            variant="outline"
            className="font-mono text-[10px] font-normal"
          >
            {building.typology}
          </Badge>
        )}
      </div>

      <h1 className="mb-1 font-mono text-3xl font-light tracking-tight">
        {building.name}
      </h1>
      {building.nameKo && (
        <p className="mb-4 text-sm text-muted-foreground">{building.nameKo}</p>
      )}
      <div className="mb-8 h-px w-16 bg-foreground/20" />

      <p className="mb-8 font-mono text-sm leading-relaxed text-muted-foreground">
        {building.description}
      </p>

      <div className="mb-8 space-y-3 border-l border-border pl-4">
        {architect && (
          <div>
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
              Architect
            </span>
            <p className="font-mono text-sm">
              <Link
                href={`/map/architects/${architect.slug}`}
                className="underline-offset-4 hover:underline"
              >
                {architect.name}
              </Link>
            </p>
          </div>
        )}
        {city && (
          <div>
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
              City
            </span>
            <p className="font-mono text-sm">
              <Link
                href={`/map/cities/${city.slug}`}
                className="underline-offset-4 hover:underline"
              >
                {city.name}, {city.country}
              </Link>
            </p>
          </div>
        )}
        <div>
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
            Address
          </span>
          <p className="font-mono text-sm">{building.address}</p>
        </div>
        <div>
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
            Coordinates
          </span>
          <p className="font-mono text-sm">
            {building.location.lat.toFixed(4)},{" "}
            {building.location.lng.toFixed(4)}
          </p>
        </div>
      </div>

      {building.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {building.tags.map((tag) => (
            <Badge
              key={tag.slug}
              variant="secondary"
              className="font-mono text-[10px] font-normal"
            >
              {tag.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
