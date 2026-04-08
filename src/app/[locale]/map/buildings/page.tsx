import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getBuildings,
  getArchitectById,
  getCityById,
  getAllTags,
} from "@/lib/data/data";
import { TagBadge } from "@/components/ui/tag-badge";
import { Divider } from "@/components/ui/divider";
import { SelectionToggleButton } from "@/components/features/selection/selection-toggle-button";
import { SelectionBar } from "@/components/features/selection/selection-bar";
import { ViewToggle } from "@/components/features/buildings/view-toggle";
import { BuildingGridCard } from "@/components/features/buildings/building-grid-card";
import { StaggerContainer, StaggerItem } from "@/components/shared/motion-wrapper";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string }>;
}

export const metadata: Metadata = {
  title: "Buildings",
};

export default async function BuildingsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { view } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const buildings = getBuildings();
  const allTags = getAllTags();
  const isGrid = view === "grid";

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-label text-muted-foreground uppercase">
            {t("archive.label")}
          </p>
          <h1 className="mb-2 font-mono text-3xl font-light tracking-tight">
            {t("nav.buildings")}
          </h1>
          <p className="mb-8 font-mono text-sm text-muted-foreground">
            {t("archive.entries", { count: buildings.length })}
          </p>
        </div>
        <Suspense>
          <ViewToggle />
        </Suspense>
      </div>
      <Divider className="mb-8" />

      {/* Tag bar */}
      <div className="mb-8 flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <Link key={tag.slug} href={`/map/buildings/tags/${tag.slug}`}>
            <TagBadge variant="outline" className="cursor-pointer hover:bg-accent">
              {tag.label}
            </TagBadge>
          </Link>
        ))}
      </div>

      {isGrid ? (
        <StaggerContainer className="grid gap-px border border-border grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {buildings.map((building) => {
            const architect = getArchitectById(building.architectId);
            return (
              <StaggerItem key={building.id}>
                <BuildingGridCard building={building} architect={architect} />
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      ) : (
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
                        <TagBadge variant="outline">
                          {building.typology}
                        </TagBadge>
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
      )}

      <SelectionBar />
    </div>
  );
}
