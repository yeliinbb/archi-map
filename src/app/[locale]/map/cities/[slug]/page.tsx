import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import {
  getCities,
  getCityBySlug,
  getBuildingsByCity,
  getArchitectById,
} from "@/lib/data/data";
import { TagBadge } from "@/components/ui/tag-badge";
import { Divider } from "@/components/ui/divider";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  return getCities().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: "Not Found" };
  return { title: city.name };
}

export default async function CityDetailPage({ params }: Props) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("detail");

  const city = getCityBySlug(slug);
  if (!city) notFound();

  const buildings = getBuildingsByCity(city.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <Link
        href="/map/cities"
        className="mb-8 inline-block font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("backCities")}
      </Link>

      <div className="mb-3 flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {city.country}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {city.location.lat.toFixed(4)}, {city.location.lng.toFixed(4)}
        </span>
      </div>

      <h1 className="mb-1 font-mono text-3xl font-light tracking-tight">
        {city.name}
      </h1>
      {city.nameKo && (
        <p className="mb-4 text-sm text-muted-foreground">{city.nameKo}</p>
      )}
      <Divider className="mb-8" />

      <p className="mb-8 font-mono text-sm leading-relaxed text-muted-foreground">
        {city.description}
      </p>

      {buildings.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-mono text-xs tracking-sublabel text-muted-foreground uppercase">
            {t("buildingsIn", { name: city.name })}
          </h2>
          <div className="space-y-px border border-border">
            {buildings.map((building) => {
              const architect = getArchitectById(building.architectId);
              return (
                <Link
                  key={building.id}
                  href={`/map/buildings/${building.slug}`}
                  className="group flex items-center justify-between border border-border bg-background px-4 py-3 transition-colors hover:bg-accent"
                >
                  <div>
                    <span className="font-mono text-sm">{building.name}</span>
                    <span className="ml-2 font-mono text-micro text-muted-foreground">
                      {building.year} · {architect?.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {city.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {city.tags.map((tag) => (
            <TagBadge key={tag.slug}>
              {tag.label}
            </TagBadge>
          ))}
        </div>
      )}
    </div>
  );
}
