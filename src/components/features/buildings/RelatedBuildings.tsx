import { Link } from "@/i18n/navigation";
import { getArchitectById } from "@/lib/data/data";
import { getArchitectColor } from "@/lib/architect-colors";
import { TagBadge } from "@/components/ui";
import type { Building } from "@/types";

interface RelatedBuildingsProps {
  buildings: Building[];
}

export function RelatedBuildings({ buildings }: RelatedBuildingsProps) {
  if (buildings.length === 0) return null;

  return (
    <div className="grid gap-px border border-border sm:grid-cols-2">
      {buildings.map((building) => {
        const architect = getArchitectById(building.architectId);
        const color = getArchitectColor(building.architectId);

        return (
          <Link
            key={building.id}
            href={`/map/buildings/${building.slug}`}
            className="group flex items-center gap-4 border border-border bg-background p-4 transition-colors hover:bg-accent"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-mono text-xs tracking-wide">
                {building.name}
              </h3>
              <p className="font-mono text-micro text-muted-foreground">
                {architect?.name} · {building.year}
              </p>
            </div>
            {building.tags[0] ? (
              <TagBadge variant="outline" className="shrink-0">
                {building.tags[0].label}
              </TagBadge>
            ) : null}
            <span className="shrink-0 font-mono text-micro text-muted-foreground transition-colors group-hover:text-foreground">
              →
            </span>
          </Link>
        );
      })}
    </div>
  );
}
