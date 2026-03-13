import type { Metadata } from "next";
import Link from "next/link";
import { getCities, getBuildingsByCity } from "@/lib/data/data";

export const metadata: Metadata = {
  title: "Cities",
};

export default function CitiesPage() {
  const cities = getCities();

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <p className="mb-2 font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
        Archive
      </p>
      <h1 className="mb-2 font-mono text-3xl font-light tracking-tight">
        Cities
      </h1>
      <p className="mb-8 font-mono text-sm text-muted-foreground">
        {cities.length} entries
      </p>
      <div className="mb-12 h-px w-16 bg-foreground/20" />

      <div className="grid gap-px border border-border sm:grid-cols-2">
        {cities.map((city) => {
          const buildingCount = getBuildingsByCity(city.id).length;

          return (
            <Link
              key={city.id}
              href={`/map/cities/${city.slug}`}
              className="group flex flex-col justify-between border border-border bg-background p-6 transition-colors hover:bg-accent"
            >
              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {city.country}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {city.location.lat.toFixed(2)}°,{" "}
                    {city.location.lng.toFixed(2)}°
                  </span>
                </div>
                <h2 className="mb-1 font-mono text-base tracking-wide">
                  {city.name}
                </h2>
                {city.nameKo && (
                  <p className="mb-2 text-xs text-muted-foreground">
                    {city.nameKo}
                  </p>
                )}
                <p className="mb-3 font-mono text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {city.description}
                </p>
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                <span>
                  {buildingCount} building{buildingCount !== 1 ? "s" : ""}
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
