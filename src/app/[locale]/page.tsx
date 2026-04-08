import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getBuildings,
  getArchitects,
  getCities,
  getFeaturedBuildings,
  getArchitectById,
} from "@/lib/data/data";
import { Divider } from "@/components/ui/divider";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/motion-wrapper";
import { OptimizedImage } from "@/components/shared/optimized-image";
import { getArchitectColor } from "@/lib/architect-colors";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const featured = getFeaturedBuildings();

  const entryPoints = [
    {
      title: t("home.buildings.title"),
      description: t("home.buildings.description"),
      href: "/map/buildings" as const,
      count: getBuildings().length.toString(),
    },
    {
      title: t("home.architects.title"),
      description: t("home.architects.description"),
      href: "/map/architects" as const,
      count: getArchitects().length.toString(),
    },
    {
      title: t("home.cities.title"),
      description: t("home.cities.description"),
      href: "/map/cities" as const,
      count: getCities().length.toString(),
    },
    {
      title: t("home.map.title"),
      description: t("home.map.description"),
      href: "/map" as const,
      count: "—",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <FadeIn>
          <p className="mb-4 font-mono text-xs tracking-label text-muted-foreground uppercase">
            {t("home.subtitle")}
          </p>
        </FadeIn>
        <FadeIn>
          <h1 className="mb-6 max-w-2xl font-mono text-4xl font-light tracking-tight sm:text-5xl md:text-6xl">
            Archi
            <br />
            Curation
          </h1>
        </FadeIn>
        <Divider size="lg" className="mb-8" />
        <FadeIn>
          <p className="max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
            {t("home.description")}
          </p>
        </FadeIn>
      </section>

      {/* Featured Curation */}
      <section className="mb-16">
        <FadeIn>
          <p className="mb-2 font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
            {t("home.featured.label")}
          </p>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-mono text-lg tracking-wide">
              {t("home.featured.curation")}
            </h2>
            <Link
              href="/map/buildings"
              className="font-mono text-micro text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("home.featured.viewAll")}
            </Link>
          </div>
        </FadeIn>
        <StaggerContainer className="flex gap-px overflow-x-auto border border-border">
          {featured.map((building) => {
            const architect = getArchitectById(building.architectId);
            const color = getArchitectColor(building.architectId);
            return (
              <StaggerItem key={building.id} className="shrink-0">
                <Link
                  href={`/map/buildings/${building.slug}`}
                  className="group block w-72 border border-border bg-background transition-colors hover:bg-accent"
                >
                  {building.images[0]?.src ? (
                    <OptimizedImage
                      src={building.images[0].src}
                      alt={building.images[0].alt}
                      fill
                      aspectRatio="4/3"
                      sizes="288px"
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex aspect-[4/3] items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-mono text-micro text-muted-foreground">
                        {building.year}
                      </span>
                    </div>
                    <h3 className="mb-1 font-mono text-sm tracking-wide">
                      {building.name}
                    </h3>
                    {architect ? (
                      <p className="font-mono text-micro text-muted-foreground">
                        {architect.name}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* Entry point cards */}
      <StaggerContainer className="grid gap-px border border-border sm:grid-cols-2 lg:grid-cols-4">
        {entryPoints.map((item) => (
          <StaggerItem key={item.href}>
            <Link
              href={item.href}
              className="group flex flex-col justify-between border border-border bg-background p-6 transition-colors hover:bg-accent"
            >
              <div>
                <span className="mb-1 block font-mono text-micro text-muted-foreground">
                  {item.count}
                </span>
                <h2 className="mb-2 font-mono text-lg tracking-wide">
                  {item.title}
                </h2>
                <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <div className="mt-6 font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                {t("home.explore")}
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="py-24" />
    </div>
  );
}
