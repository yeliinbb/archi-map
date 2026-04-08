"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useMapFilterStore } from "@/lib/stores/map-filter-store";
import { TagBadge } from "@/components/ui/tag-badge";
import type { City, Tag } from "@/types";

interface MapFiltersProps {
  cities: City[];
  tags: Tag[];
}

export function MapFilters({ cities, tags }: MapFiltersProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("map");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const {
    selectedCityIds,
    selectedTagSlugs,
    toggleCity,
    toggleTag,
    clearFilters,
    hasFilters,
    syncFromUrl,
    toSearchParams,
  } = useMapFilterStore();

  // URL → store hydration on mount
  useEffect(() => {
    syncFromUrl(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Store → URL sync on filter change
  useEffect(() => {
    const params = toSearchParams();
    const search = params.toString();
    const newUrl = search ? `${pathname}?${search}` : pathname;
    router.replace(newUrl, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCityIds, selectedTagSlugs]);

  const active = hasFilters();

  return (
    <div className="absolute left-4 top-4 z-10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-micro tracking-wider backdrop-blur-sm transition-colors ${
          active
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background/80 text-muted-foreground hover:text-foreground"
        }`}
      >
        <SlidersHorizontal className="h-3 w-3" />
        {t("filters")}
        {active ? (
          <span className="ml-1">
            ({selectedCityIds.length + selectedTagSlugs.length})
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mt-2 max-h-[50vh] w-64 overflow-y-auto border border-border bg-background/95 p-3 backdrop-blur-sm"
          >
            {/* City filter */}
            <div className="mb-4">
              <p className="mb-2 font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
                {t("filterCity")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cities.map((city) => {
                  const isActive = selectedCityIds.includes(city.id);
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => toggleCity(city.id)}
                    >
                      <TagBadge
                        variant={isActive ? "default" : "outline"}
                        className={`cursor-pointer ${isActive ? "bg-foreground text-background" : ""}`}
                      >
                        {city.name}
                      </TagBadge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tag filter */}
            <div className="mb-4">
              <p className="mb-2 font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
                {t("filterTag")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => {
                  const isActive = selectedTagSlugs.includes(tag.slug);
                  return (
                    <button
                      key={tag.slug}
                      type="button"
                      onClick={() => toggleTag(tag.slug)}
                    >
                      <TagBadge
                        variant={isActive ? "default" : "outline"}
                        className={`cursor-pointer ${isActive ? "bg-foreground text-background" : ""}`}
                      >
                        {tag.label}
                      </TagBadge>
                    </button>
                  );
                })}
              </div>
            </div>

            {active ? (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 font-mono text-micro text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3 w-3" />
                {t("clearFilters")}
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
