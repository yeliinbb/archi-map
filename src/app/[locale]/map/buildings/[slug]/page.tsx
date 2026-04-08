import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import {
  getBuildingBySlug,
  getBuildings,
  getArchitectById,
  getCityById,
  getRelatedBuildings,
} from "@/lib/data/data";
import { TagBadge, Divider } from "@/components/ui";
import { OptimizedImage } from "@/components/shared";
import { SelectionToggleButton, SelectionBar } from "@/components/features/selection";
import { RelatedBuildings } from "@/components/features/buildings";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
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
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("detail");

  const building = getBuildingBySlug(slug);
  if (!building) notFound();

  const architect = getArchitectById(building.architectId);
  const city = getCityById(building.cityId);
  const relatedBuildings = getRelatedBuildings(building, 4);

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <Link
        href="/map/buildings"
        className="mb-8 inline-block font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("backBuildings")}
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

      {building.images[0]?.src ? (
        <div className="mb-8">
          <div className="overflow-hidden border border-border">
            <OptimizedImage
              src={building.images[0].src}
              alt={building.images[0].alt}
              fill
              aspectRatio="16/9"
              sizes="(max-width: 672px) 100vw, 672px"
              priority
            />
          </div>
          {building.images[0].credit ? (
            <p className="mt-1 font-mono text-micro text-muted-foreground/50">
              © {building.images[0].credit}
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mb-8 font-mono text-sm leading-relaxed text-muted-foreground">
        {building.description}
      </p>

      <div className="mb-8 space-y-3 border-l border-border pl-4">
        {architect && (
          <div>
            <span className="font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
              {t("architect")}
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
              {t("city")}
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
            {t("address")}
          </span>
          <p className="font-mono text-sm">{building.address}</p>
        </div>
      </div>

      <div className="mb-8">
        <span className="mb-2 block font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
          {t("location")}
        </span>
        <div className="overflow-hidden border border-border">
          <iframe
            title={t("mapOf", { name: building.name })}
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
          {t("openGoogleMaps")}
        </a>
      </div>

      {building.tags.length > 0 ? (
        <div className="mb-12 flex flex-wrap gap-2">
          {building.tags.map((tag) => (
            <Link key={tag.slug} href={`/map/buildings/tags/${tag.slug}`}>
              <TagBadge className="cursor-pointer hover:bg-accent">
                {tag.label}
              </TagBadge>
            </Link>
          ))}
        </div>
      ) : null}

      {/* Related Buildings */}
      {relatedBuildings.length > 0 ? (
        <div className="mb-8">
          <span className="mb-4 block font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
            {t("relatedBuildings")}
          </span>
          <RelatedBuildings buildings={relatedBuildings} />
        </div>
      ) : null}

      <SelectionBar />
    </div>
  );
}
