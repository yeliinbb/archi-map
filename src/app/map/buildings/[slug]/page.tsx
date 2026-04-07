import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBuildingBySlug,
  getBuildings,
  getArchitectById,
  getCityById,
} from "@/lib/data/data";
import { TagBadge } from "@/components/ui/tag-badge";
import { Divider } from "@/components/ui/divider";
import { SelectionToggleButton } from "@/components/features/selection/selection-toggle-button";
import { SelectionBar } from "@/components/features/selection/selection-bar";

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
          <TagBadge variant="outline">
            {building.typology}
          </TagBadge>
        )}
      </div>

      <div className="mb-1 flex items-center gap-3">
        <h1 className="font-mono text-3xl font-light tracking-tight">
          {building.name}
        </h1>
        <SelectionToggleButton
          buildingId={building.id}
          architectId={building.architectId}
        />
      </div>
      {building.nameKo && (
        <p className="mb-4 text-sm text-muted-foreground">{building.nameKo}</p>
      )}
      <Divider className="mb-8" />

      {building.images[0]?.src && (
        <div className="mb-8 overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={building.images[0].src}
            alt={building.images[0].alt}
            className="w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <p className="mb-8 font-mono text-sm leading-relaxed text-muted-foreground">
        {building.description}
      </p>

      <div className="mb-8 space-y-3 border-l border-border pl-4">
        {architect && (
          <div>
            <span className="font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
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
            <span className="font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
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
          <span className="font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
            Address
          </span>
          <p className="font-mono text-sm">{building.address}</p>
        </div>
      </div>

      <div className="mb-8">
        <span className="mb-2 block font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
          Location
        </span>
        <div className="overflow-hidden border border-border">
          <iframe
            title={`Map of ${building.name}`}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${building.location.lng - 0.005},${building.location.lat - 0.003},${building.location.lng + 0.005},${building.location.lat + 0.003}&layer=mapnik&marker=${building.location.lat},${building.location.lng}`}
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(building.name + ", " + building.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Open in Google Maps ↗
        </a>
      </div>

      {building.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {building.tags.map((tag) => (
            <TagBadge key={tag.slug}>
              {tag.label}
            </TagBadge>
          ))}
        </div>
      )}
      <SelectionBar />
    </div>
  );
}
