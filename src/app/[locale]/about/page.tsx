import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBuildings, getArchitects, getCities } from "@/lib/data/data";
import { Divider } from "@/components/ui";
import { FadeInView } from "@/components/shared";

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "About",
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const stats = {
    buildings: getBuildings().length,
    architects: getArchitects().length,
    cities: getCities().length,
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <p className="mb-2 font-mono text-xs tracking-label text-muted-foreground uppercase">
        {t("title")}
      </p>
      <h1 className="mb-8 font-mono text-3xl font-light tracking-tight">
        {t("siteName")}
      </h1>
      <Divider className="mb-8" />

      <div className="space-y-6 font-mono text-sm leading-relaxed text-muted-foreground">
        <p>{t("description1")}</p>
        <p>{t("description2")}</p>
        <p>{t("description3")}</p>
      </div>

      <Divider className="my-12" />

      {/* Quote */}
      <FadeInView>
        <div className="border-l border-border pl-4">
          <p className="font-mono text-xs italic text-muted-foreground">
            &quot;{t("quote")}&quot;
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {t("quoteAuthor")}
          </p>
        </div>
      </FadeInView>

      <Divider className="my-12" />

      {/* Archive Stats */}
      <FadeInView>
        <p className="mb-4 font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
          {t("archive")}
        </p>
        <div className="grid grid-cols-3 gap-px border border-border">
          <div className="border border-border bg-background p-4 text-center">
            <span className="block font-mono text-2xl font-light">
              {stats.buildings}
            </span>
            <span className="font-mono text-micro text-muted-foreground">
              {t("statBuildings")}
            </span>
          </div>
          <div className="border border-border bg-background p-4 text-center">
            <span className="block font-mono text-2xl font-light">
              {stats.architects}
            </span>
            <span className="font-mono text-micro text-muted-foreground">
              {t("statArchitects")}
            </span>
          </div>
          <div className="border border-border bg-background p-4 text-center">
            <span className="block font-mono text-2xl font-light">
              {stats.cities}
            </span>
            <span className="font-mono text-micro text-muted-foreground">
              {t("statCities")}
            </span>
          </div>
        </div>
      </FadeInView>

      <Divider className="my-12" />

      {/* Tech Stack */}
      <FadeInView>
        <p className="mb-4 font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
          {t("techStack")}
        </p>
        <div className="grid grid-cols-2 gap-px border border-border sm:grid-cols-3">
          {[
            "Next.js 16",
            "TypeScript",
            "Tailwind CSS 4",
            "MapLibre GL",
            "D3.js",
            "Zustand",
          ].map((tech) => (
            <div
              key={tech}
              className="border border-border bg-background px-3 py-2 font-mono text-micro text-muted-foreground"
            >
              {tech}
            </div>
          ))}
        </div>
      </FadeInView>

      <Divider className="my-12" />

      {/* Links */}
      <FadeInView>
        <p className="mb-4 font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
          {t("links")}
        </p>
        <div className="space-y-2">
          <a
            href="https://github.com/yeliinbb/archi-map"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            GitHub ↗
          </a>
        </div>
      </FadeInView>

      <div className="py-12" />
    </div>
  );
}
