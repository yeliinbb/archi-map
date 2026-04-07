import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getBuildings, getArchitects, getCities } from "@/lib/data/data";
import { Divider } from "@/components/ui/divider";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

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
        <p className="mb-4 font-mono text-xs tracking-label text-muted-foreground uppercase">
          {t("home.subtitle")}
        </p>
        <h1 className="mb-6 max-w-2xl font-mono text-4xl font-light tracking-tight sm:text-5xl md:text-6xl">
          Archi
          <br />
          Curation
        </h1>
        <Divider size="lg" className="mb-8" />
        <p className="max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
          {t("home.description")}
        </p>
      </section>

      {/* Entry point cards */}
      <section className="grid gap-px border border-border sm:grid-cols-2 lg:grid-cols-4">
        {entryPoints.map((item) => (
          <Link
            key={item.href}
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
        ))}
      </section>

      <div className="py-24" />
    </div>
  );
}
