import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getBuildingsByTag,
  getAllTags,
  getArchitectById,
  getCityById,
} from "@/lib/data/data";
import { TagBadge } from "@/components/ui/tag-badge";
import { Divider } from "@/components/ui/divider";
import { SelectionToggleButton } from "@/components/features/selection/selection-toggle-button";
import { SelectionBar } from "@/components/features/selection/selection-bar";
import { StaggerContainer, StaggerItem } from "@/components/shared/motion-wrapper";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = getAllTags().find((t) => t.slug === slug);
  return { title: tag?.label ?? "Tag" };
}

export default async function TagBuildingsPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const buildings = getBuildingsByTag(slug);
  const tag = getAllTags().find((tg) => tg.slug === slug);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <Link
        href="/map/buildings"
        className="mb-8 inline-block font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("detail.backBuildings")}
      </Link>

      <p className="mb-2 font-mono text-xs tracking-label text-muted-foreground uppercase">
        {t("buildings.taggedWith", { tag: tag?.label ?? slug })}
      </p>
      <h1 className="mb-2 font-mono text-3xl font-light tracking-tight">
        {tag?.label ?? slug}
      </h1>
      <p className="mb-8 font-mono text-sm text-muted-foreground">
        {t("buildings.resultsCount", { count: buildings.length })}
      </p>
      <Divider className="mb-12" />

      <StaggerContainer className="grid gap-px border border-border sm:grid-cols-2">
        {buildings.map((building) => {
          const architect = getArchitectById(building.architectId);
          const city = getCityById(building.cityId);

          return (
            <StaggerItem key={building.id}>
              <Link
                href={`/map/buildings/${building.slug}`}
                className="group flex flex-col justify-between border border-border bg-background p-6 transition-colors hover:bg-accent"
              >
                <div>
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="font-mono text-micro text-muted-foreground">
                      {building.year}
                    </span>
                    {building.typology ? (
                      <TagBadge variant="outline">{building.typology}</TagBadge>
                    ) : null}
                  </div>
                  <h2 className="mb-1 font-mono text-base tracking-wide">
                    {building.name}
                  </h2>
                  <p className="mb-3 font-mono text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {building.description}
                  </p>
                </div>
                <div className="flex items-center justify-between font-mono text-micro text-muted-foreground">
                  <span>
                    {architect?.name} · {city?.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <SelectionToggleButton
                      buildingId={building.id}
                      architectId={building.architectId}
                    />
                    <span className="transition-colors group-hover:text-foreground">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <SelectionBar />
    </div>
  );
}
