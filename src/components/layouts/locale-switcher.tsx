"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale() {
    const next = locale === "en" ? "ko" : "en";
    router.replace(pathname, { locale: next });
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="px-2 py-1 font-mono text-xs tracking-wider text-muted-foreground transition-colors hover:text-foreground"
    >
      {locale === "en" ? "KO" : "EN"}
    </button>
  );
}
