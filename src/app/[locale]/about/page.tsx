import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Divider } from "@/components/ui";

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
        <div className="border-l border-border pl-4">
          <p className="text-xs italic">&quot;{t("quote")}&quot;</p>
          <p className="mt-1 text-xs">{t("quoteAuthor")}</p>
        </div>
      </div>
    </div>
  );
}
