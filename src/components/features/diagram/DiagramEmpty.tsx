"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function DiagramEmpty() {
  const t = useTranslations("diagram.empty");

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <p className="mb-2 font-mono text-xs tracking-label text-muted-foreground uppercase">
        {t("title")}
      </p>
      <h2 className="mb-4 font-mono text-xl font-light tracking-tight">
        {t("subtitle")}
      </h2>
      <p className="mb-8 max-w-sm text-center font-mono text-xs leading-relaxed text-muted-foreground">
        {t("description")}
      </p>
      <div className="flex gap-3">
        <Link
          href="/map"
          className="border border-foreground bg-foreground px-4 py-2 font-mono text-micro tracking-wider text-background transition-colors hover:bg-foreground/90"
        >
          {t("goToMap")}
        </Link>
        <Link
          href="/map/buildings"
          className="border border-border px-4 py-2 font-mono text-micro tracking-wider transition-colors hover:bg-accent"
        >
          {t("browseBuildings")}
        </Link>
      </div>
    </div>
  );
}
