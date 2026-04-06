import Link from "next/link";
import { getBuildings, getArchitects, getCities } from "@/lib/data/data";

const entryPoints = [
  {
    title: "Buildings",
    description: "Explore curated architectural works across the globe",
    href: "/map/buildings",
    count: getBuildings().length.toString(),
  },
  {
    title: "Architects",
    description: "Discover the minds behind iconic structures",
    href: "/map/architects",
    count: getArchitects().length.toString(),
  },
  {
    title: "Cities",
    description: "Navigate architecture through urban geography",
    href: "/map/cities",
    count: getCities().length.toString(),
  },
  {
    title: "Map",
    description: "See everything plotted on a global map",
    href: "/map",
    count: "—",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="mb-4 font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Curated Architecture Archive
        </p>
        <h1 className="mb-6 max-w-2xl font-mono text-4xl font-light tracking-tight sm:text-5xl md:text-6xl">
          Archi
          <br />
          Curation
        </h1>
        <div className="mb-8 h-px w-24 bg-foreground/20" />
        <p className="max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
          A curated collection of architectural works, architects, and cities —
          mapped, cataloged, and interconnected.
        </p>
      </section>

      {/* Entry point cards */}
      <section className="grid gap-px border border-border sm:grid-cols-2 lg:grid-cols-4">
        {entryPoints.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col justify-between border border-border bg-background p-6 transition-colors hover:bg-accent"
          >
            <div>
              <span className="mb-1 block font-mono text-[10px] text-muted-foreground">
                {item.count}
              </span>
              <h2 className="mb-2 font-mono text-lg tracking-wide">
                {item.title}
              </h2>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
            <div className="mt-6 font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
              Explore →
            </div>
          </Link>
        ))}
      </section>

      <div className="py-24" />
    </div>
  );
}
