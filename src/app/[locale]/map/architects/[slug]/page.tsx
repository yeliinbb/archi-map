import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import {
  getArchitects,
  getArchitectBySlug,
  getBuildingsByArchitect,
  getCityById,
} from "@/lib/data/data";
import { TagBadge } from "@/components/ui/tag-badge";
import { Divider } from "@/components/ui/divider";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  return getArchitects().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const architect = getArchitectBySlug(slug);
  if (!architect) return { title: "Not Found" };
  return { title: architect.name };
}

export default async function ArchitectDetailPage({ params }: Props) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const architect = getArchitectBySlug(slug);
  if (!architect) notFound();

  const buildings = getBuildingsByArchitect(architect.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <Link
        href="/map/architects"
        className="mb-8 inline-block font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("detail.backArchitects")}
      </Link>

      <div className="mb-3 flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {architect.nationality}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {architect.birthYear}
          {architect.deathYear
            ? `–${architect.deathYear}`
            : t("archive.present")}
        </span>
      </div>

      <h1 className="mb-1 font-mono text-3xl font-light tracking-tight">
        {architect.name}
      </h1>
      {architect.nameKo && (
        <p className="mb-4 text-sm text-muted-foreground">
          {architect.nameKo}
        </p>
      )}
      <Divider className="mb-8" />

      <p className="mb-8 font-mono text-sm leading-relaxed text-muted-foreground">
        {architect.bio}
      </p>

      {architect.website && (
        <div className="mb-8">
          <span className="font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
            {t("detail.website")}
          </span>
          <p className="font-mono text-sm">
            <a
              href={architect.website}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              {architect.website.replace(/^https?:\/\//, "")}
            </a>
          </p>
        </div>
      )}

      {buildings.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 font-mono text-xs tracking-sublabel text-muted-foreground uppercase">
            {t("detail.buildingsInArchive")}
          </h2>
          <div className="space-y-px border border-border">
            {buildings.map((building) => {
              const city = getCityById(building.cityId);
              return (
                <Link
                  key={building.id}
                  href={`/map/buildings/${building.slug}`}
                  className="group flex items-center justify-between border border-border bg-background px-4 py-3 transition-colors hover:bg-accent"
                >
                  <div>
                    <span className="font-mono text-sm">{building.name}</span>
                    <span className="ml-2 font-mono text-micro text-muted-foreground">
                      {building.year} · {city?.name}
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

      {architect.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {architect.tags.map((tag) => (
            <TagBadge key={tag.slug}>
              {tag.label}
            </TagBadge>
          ))}
        </div>
      )}
    </div>
  );
}
