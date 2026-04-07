import Link from "next/link";

export function DiagramEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <p className="mb-2 font-mono text-xs tracking-label text-muted-foreground uppercase">
        No Selection
      </p>
      <h2 className="mb-4 font-mono text-xl font-light tracking-tight">
        Select buildings to generate a diagram
      </h2>
      <p className="mb-8 max-w-sm text-center font-mono text-xs leading-relaxed text-muted-foreground">
        Choose buildings from the map or building list to visualize their
        relationships with architects and cities.
      </p>
      <div className="flex gap-3">
        <Link
          href="/map"
          className="border border-foreground bg-foreground px-4 py-2 font-mono text-micro tracking-wider text-background transition-colors hover:bg-foreground/90"
        >
          Go to Map
        </Link>
        <Link
          href="/map/buildings"
          className="border border-border px-4 py-2 font-mono text-micro tracking-wider transition-colors hover:bg-accent"
        >
          Browse Buildings
        </Link>
      </div>
    </div>
  );
}
