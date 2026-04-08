import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCities, getBuildingsByCity } from "@/lib/data/data";
import { Divider } from "@/components/ui/divider";
import { StaggerContainer, StaggerItem } from "@/components/shared/motion-wrapper";

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Cities",
};

export default async function CitiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const cities = getCities();

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <p className="mb-2 font-mono text-xs tracking-label text-muted-foreground uppercase">
        {t("archive.label")}
      </p>
      <h1 className="mb-2 font-mono text-3xl font-light tracking-tight">
        {t("nav.cities")}
      </h1>
      <p className="mb-8 font-mono text-sm text-muted-foreground">
        {t("archive.entries", { count: cities.length })}
      </p>
      <Divider className="mb-12" />

      <StaggerContainer className="grid gap-px border border-border sm:grid-cols-2">
        {cities.map((city) => {
          const buildingCount = getBuildingsByCity(city.id).length;

          return (
            <StaggerItem key={city.id}>
            <Link
              href={`/map/cities/${city.slug}`}
              className="group flex flex-col justify-between border border-border bg-background p-6 transition-colors hover:bg-accent"
            >
              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="font-mono text-micro text-muted-foreground">
                    {city.country}
                  </span>
                  <span className="font-mono text-micro text-muted-foreground">
                    {city.location.lat.toFixed(2)}°,{" "}
                    {city.location.lng.toFixed(2)}°
                  </span>
                </div>
                <h2 className="mb-1 font-mono text-base tracking-wide">
                  {city.name}
                </h2>
                {city.nameKo && (
                  <p className="mb-2 text-xs text-muted-foreground">
                    {city.nameKo}
                  </p>
                )}
                <p className="mb-3 font-mono text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {city.description}
                </p>
              </div>
              <div className="flex items-center justify-between font-mono text-micro text-muted-foreground">
                <span>
                  {t("archive.building", { count: buildingCount })}
                </span>
                <span className="transition-colors group-hover:text-foreground">
                  →
                </span>
              </div>
            </Link>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
