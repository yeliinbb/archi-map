import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Map",
};

export default function MapPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <p className="mb-2 font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
        Map
      </p>
      <h1 className="mb-8 font-mono text-3xl font-light tracking-tight">
        Global Architecture Map
      </h1>
      <div className="mb-12 h-px w-16 bg-foreground/20" />

      {/* Placeholder for future map */}
      <div className="flex aspect-[16/9] items-center justify-center border border-dashed border-border">
        <div className="text-center">
          <p className="mb-2 font-mono text-sm text-muted-foreground">
            Interactive map coming soon
          </p>
          <p className="font-mono text-xs text-muted-foreground/60">
            Buildings, architects, and cities plotted on a global map
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          { title: "Buildings", href: "/map/buildings", count: 10 },
          { title: "Architects", href: "/map/architects", count: 6 },
          { title: "Cities", href: "/map/cities", count: 4 },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group border border-border p-4 transition-colors hover:bg-accent"
          >
            <span className="font-mono text-[10px] text-muted-foreground">
              {item.count} entries
            </span>
            <h2 className="font-mono text-sm tracking-wide">
              {item.title}{" "}
              <span className="text-muted-foreground transition-colors group-hover:text-foreground">
                →
              </span>
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
