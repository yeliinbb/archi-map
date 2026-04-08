import { Link } from "@/i18n/navigation";
import { TagBadge } from "@/components/ui";
import { OptimizedImage } from "@/components/shared";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
}

const formatDateRange = (start: string, end?: string): string => {
  const startDate = new Date(start);
  const startStr = startDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  if (!end) return startStr;
  const endDate = new Date(end);
  const endStr = endDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/map/events/${event.slug}`}
      className="group block border border-border bg-background transition-colors hover:bg-accent"
    >
      {event.images[0]?.src ? (
        <OptimizedImage
          src={event.images[0].src}
          alt={event.images[0].alt}
          fill
          aspectRatio="4/3"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-muted">
          <span className="font-mono text-micro text-muted-foreground">
            {formatDateRange(event.date.start, event.date.end)}
          </span>
        </div>
      )}
      <div className="p-3">
        <div className="mb-1">
          <span className="font-mono text-micro text-muted-foreground">
            {formatDateRange(event.date.start, event.date.end)}
          </span>
        </div>
        <h3 className="mb-1 truncate font-mono text-xs tracking-wide">
          {event.title}
        </h3>
        <p className="truncate font-mono text-micro text-muted-foreground">
          {event.venue}
        </p>
      </div>
    </Link>
  );
}
