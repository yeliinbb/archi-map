import type { Metadata } from "next";
import Link from "next/link";
import { getBuildings, getArchitectById, getCityById } from "@/lib/data/data";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Buildings",
};

export default function BuildingsPage() {
  const buildings = getBuildings();

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <p className="mb-2 font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
        Archive
      </p>
      <h1 className="mb-2 font-mono text-3xl font-light tracking-tight">
        Buildings
      </h1>
      <p className="mb-8 font-mono text-sm text-muted-foreground">
        {buildings.length} entries
      </p>
      <div className="mb-12 h-px w-16 bg-foreground/20" />

      <div className="grid gap-px border border-border sm:grid-cols-2">
        {buildings.map((building) => {
          const architect = getArchitectById(building.architectId);
          const city = getCityById(building.cityId);

          return (
            <Link
              key={building.id}
              href={`/map/buildings/${building.slug}`}
              className="group flex flex-col justify-between border border-border bg-background p-6 transition-colors hover:bg-accent"
            >
              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {building.year}
                  </span>
                  {building.typology && (
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] font-normal"
                    >
                      {building.typology}
                    </Badge>
                  )}
                </div>
                <h2 className="mb-1 font-mono text-base tracking-wide">
                  {building.name}
                </h2>
                {building.nameKo && (
                  <p className="mb-2 text-xs text-muted-foreground">
                    {building.nameKo}
                  </p>
                )}
                <p className="mb-3 font-mono text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {building.description}
                </p>
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                <span>
                  {architect?.name} · {city?.name}
                </span>
                <span className="transition-colors group-hover:text-foreground">
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
