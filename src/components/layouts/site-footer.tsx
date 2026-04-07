"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations();

  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <div className="flex h-5 w-5 items-center justify-center border border-muted-foreground/40">
            <span className="text-[8px] font-bold leading-none">
              {t("site.short")}
            </span>
          </div>
          <span className="tracking-wider">
            {t("site.copyright", { year: new Date().getFullYear() })}
          </span>
        </div>

        <nav className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
          <Link
            href="/about"
            className="tracking-wider transition-colors hover:text-foreground"
          >
            {t("nav.about")}
          </Link>
          <span className="text-border">|</span>
          <Link
            href="/map/buildings"
            className="tracking-wider transition-colors hover:text-foreground"
          >
            {t("nav.buildings")}
          </Link>
          <span className="text-border">|</span>
          <Link
            href="/map/architects"
            className="tracking-wider transition-colors hover:text-foreground"
          >
            {t("nav.architects")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
