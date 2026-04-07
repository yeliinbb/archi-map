import type { Metadata } from "next";
import Link from "next/link";
import { getArchitects, getBuildingsByArchitect } from "@/lib/data/data";
import { TagBadge } from "@/components/ui/tag-badge";
import { Divider } from "@/components/ui/divider";

export const metadata: Metadata = {
  title: "Architects",
};

export default function ArchitectsPage() {
  const architects = getArchitects();

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <p className="mb-2 font-mono text-xs tracking-label text-muted-foreground uppercase">
        Archive
      </p>
      <h1 className="mb-2 font-mono text-3xl font-light tracking-tight">
        Architects
      </h1>
      <p className="mb-8 font-mono text-sm text-muted-foreground">
        {architects.length} entries
      </p>
      <Divider className="mb-12" />

      <div className="grid gap-px border border-border sm:grid-cols-2 lg:grid-cols-3">
        {architects.map((architect) => {
          const buildingCount = getBuildingsByArchitect(architect.id).length;

          return (
            <Link
              key={architect.id}
              href={`/map/architects/${architect.slug}`}
              className="group flex flex-col justify-between border border-border bg-background p-6 transition-colors hover:bg-accent"
            >
              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="font-mono text-micro text-muted-foreground">
                    {architect.nationality}
                  </span>
                  <span className="font-mono text-micro text-muted-foreground">
                    {architect.birthYear}
                    {architect.deathYear
                      ? `–${architect.deathYear}`
                      : "–present"}
                  </span>
                </div>
                <h2 className="mb-1 font-mono text-base tracking-wide">
                  {architect.name}
                </h2>
                {architect.nameKo && (
                  <p className="mb-2 text-xs text-muted-foreground">
                    {architect.nameKo}
                  </p>
                )}
                <p className="mb-3 font-mono text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {architect.bio}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {architect.tags.slice(0, 2).map((tag) => (
                    <TagBadge key={tag.slug}>
                      {tag.label}
                    </TagBadge>
                  ))}
                </div>
                <span className="font-mono text-micro text-muted-foreground">
                  {buildingCount} building{buildingCount !== 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
