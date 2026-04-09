"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSelectionStore } from "@/lib/stores/selection-store";
import { getArchitectColor } from "@/lib/architect-colors";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet";
import type { Building } from "@/types";

interface SelectionSidebarProps {
  buildings: Building[];
}

export function SelectionSidebar({ buildings }: SelectionSidebarProps) {
  const t = useTranslations("selection");
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { selectedBuildingIds, removeBuilding, clearSelection } =
    useSelectionStore();

  const selectedBuildings = selectedBuildingIds
    .map((id) => buildings.find((b) => b.id === id))
    .filter((b): b is Building => b !== undefined);

  const diagramUrl = `/diagram?ids=${selectedBuildingIds.join(",")}`;
  const count = selectedBuildingIds.length;

  if (count === 0) return null;

  const listContent = (
    <>
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <p className="font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
            {t("title")}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {count}/10
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearSelection}
            className="font-mono text-micro text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("clear")}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedBuildings.map((building) => (
          <div
            key={building.id}
            className="flex items-center gap-3 border-b border-border px-4 py-3"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor: getArchitectColor(building.architectId),
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-xs">{building.name}</p>
              <p className="font-mono text-micro text-muted-foreground">
                {building.year}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeBuilding(building.id)}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-4">
        <Link
          href={diagramUrl}
          className={`block w-full border border-foreground bg-foreground px-4 py-2 text-center font-mono text-xs tracking-wider text-background transition-colors hover:bg-foreground/90 ${
            count < 2 ? "pointer-events-none opacity-40" : ""
          }`}
        >
          {t("generateDiagram")}
        </Link>
        {count < 2 ? (
          <p className="mt-2 text-center font-mono text-micro text-muted-foreground">
            {t("selectMinimum")}
          </p>
        ) : null}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <AnimatePresence>
        {desktopOpen ? (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute right-0 top-0 z-10 hidden h-full w-72 flex-col border-l border-border bg-background/95 backdrop-blur-sm md:flex"
          >
            <button
              type="button"
              onClick={() => setDesktopOpen(false)}
              className="absolute right-2 top-2 z-20 p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            {listContent}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Desktop collapsed toggle */}
      {!desktopOpen ? (
        <button
          type="button"
          onClick={() => setDesktopOpen(true)}
          className="absolute right-4 top-4 z-10 hidden border border-foreground bg-foreground px-3 py-1.5 font-mono text-micro tracking-wider text-background md:block"
        >
          {t("title")} ({count})
        </button>
      ) : null}

      {/* Mobile floating trigger */}
      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className="absolute bottom-20 right-4 z-10"
            render={
              <button
                type="button"
                className="border border-foreground bg-foreground px-3 py-2 font-mono text-micro tracking-wider text-background"
              />
            }
          >
            {t("title")} {count}/10
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[70vh]">
            {listContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
