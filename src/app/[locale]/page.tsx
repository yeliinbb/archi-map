import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBuildings, getArchitects, getCities } from "@/lib/data/data";
import { HomeHero, HomeEntryPoints, LineAnimation } from "@/components/features/home";
import { FadeIn } from "@/components/shared";

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
      href: "/map/buildings",
      count: getBuildings().length.toString(),
      exploreLabel: t("home.explore"),
    },
    {
      title: t("home.architects.title"),
      description: t("home.architects.description"),
      href: "/map/architects",
      count: getArchitects().length.toString(),
      exploreLabel: t("home.explore"),
    },
    {
      title: t("home.cities.title"),
      description: t("home.cities.description"),
      href: "/map/cities",
      count: getCities().length.toString(),
      exploreLabel: t("home.explore"),
    },
    {
      title: t("home.map.title"),
      description: t("home.map.description"),
      href: "/map",
      count: "—",
      exploreLabel: t("home.explore"),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6">
      <HomeHero
        subtitle={t("home.subtitle")}
        description={t("home.description")}
      />

      <FadeIn>
        <LineAnimation className="mx-auto mb-16" />
      </FadeIn>

      <HomeEntryPoints items={entryPoints} />

      <div className="py-24" />
    </div>
  );
}
