import { getTranslations, setRequestLocale } from "next-intl/server";
import { getEvents } from "@/lib/data/data";
import { EventCard } from "@/components/features/events";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/shared";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");
  const events = getEvents();

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <FadeInView>
        <p className="mb-2 font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
          {t("label")}
        </p>
        <h1 className="mb-8 font-mono text-3xl font-light tracking-tight">
          {t("title")}
        </h1>
      </FadeInView>

      <StaggerContainer className="grid gap-px border border-border sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <StaggerItem key={event.id}>
            <EventCard event={event} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
