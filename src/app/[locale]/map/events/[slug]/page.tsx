import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getEventBySlug, getEvents, getCityById } from "@/lib/data/data";
import { TagBadge, Divider } from "@/components/ui";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  return getEvents().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Not Found" };
  return { title: event.title };
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default async function EventDetailPage({ params }: Props) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const event = getEventBySlug(slug);
  if (!event) notFound();

  const city = getCityById(event.cityId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <Link
        href="/map/events"
        className="mb-8 inline-block font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("events.back")}
      </Link>

      <div className="mb-3">
        <span className="font-mono text-xs text-muted-foreground">
          {formatDate(event.date.start)}
          {event.date.end ? ` – ${formatDate(event.date.end)}` : ""}
        </span>
      </div>

      <h1 className="mb-1 font-mono text-3xl font-light tracking-tight">
        {event.title}
      </h1>
      {event.titleKo ? (
        <p className="mb-4 text-sm text-muted-foreground">{event.titleKo}</p>
      ) : null}
      <Divider className="mb-8" />

      <p className="mb-8 font-mono text-sm leading-relaxed text-muted-foreground">
        {event.description}
      </p>

      <div className="mb-8 space-y-3 border-l border-border pl-4">
        <div>
          <span className="font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
            {t("events.venue")}
          </span>
          <p className="font-mono text-sm">{event.venue}</p>
        </div>
        {event.address ? (
          <div>
            <span className="font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
              {t("detail.address")}
            </span>
            <p className="font-mono text-sm">{event.address}</p>
          </div>
        ) : null}
        {city ? (
          <div>
            <span className="font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
              {t("detail.city")}
            </span>
            <p className="font-mono text-sm">
              <Link
                href={`/map/cities/${city.slug}`}
                className="underline-offset-4 hover:underline"
              >
                {city.name}, {city.country}
              </Link>
            </p>
          </div>
        ) : null}
        {event.website ? (
          <div>
            <span className="font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
              {t("detail.website")}
            </span>
            <p className="font-mono text-sm">
              <a
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                {event.website} ↗
              </a>
            </p>
          </div>
        ) : null}
      </div>

      {event.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <TagBadge key={tag.slug}>{tag.label}</TagBadge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
