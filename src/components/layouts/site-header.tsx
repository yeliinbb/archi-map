"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/layouts/locale-switcher";

export function SiteHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const navigation = [
    { name: t("nav.map"), href: "/map" },
    { name: t("nav.buildings"), href: "/map/buildings" },
    { name: t("nav.architects"), href: "/map/architects" },
    { name: t("nav.cities"), href: "/map/cities" },
    { name: t("nav.diagram"), href: "/diagram" },
    { name: t("nav.about"), href: "/about" },
  ];

  const stripLocale = (path: string) => {
    const prefix = `/${locale}`;
    return path.startsWith(prefix) ? path.slice(prefix.length) || "/" : path;
  };

  const strippedPathname = stripLocale(pathname);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center border border-foreground">
            <span className="font-mono text-micro font-bold leading-none">
              {t("site.short")}
            </span>
          </div>
          <span className="hidden font-mono text-sm tracking-widest uppercase sm:inline-block">
            {t("site.name")}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 font-mono text-xs tracking-wider transition-colors ${
                  strippedPathname === item.href ||
                  strippedPathname.startsWith(item.href + "/")
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <LocaleSwitcher />

          {/* Mobile nav */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="md:hidden"
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8" />
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="2" y1="4" x2="14" y2="4" />
                <line x1="2" y1="8" x2="14" y2="8" />
                <line x1="2" y1="12" x2="14" y2="12" />
              </svg>
              <span className="sr-only">{t("nav.menu")}</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="mt-8 flex flex-col gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`px-3 py-2 font-mono text-sm tracking-wider transition-colors ${
                      strippedPathname === item.href ||
                      strippedPathname.startsWith(item.href + "/")
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
