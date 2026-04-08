import { FadeIn } from "@/components/shared/motion-wrapper";
import { Divider } from "@/components/ui/divider";

interface HomeHeroProps {
  subtitle: string;
  description: string;
}

export function HomeHero({ subtitle, description }: HomeHeroProps) {
  return (
    <section className="relative flex min-h-[50vh] flex-col items-center justify-center py-24 text-center sm:min-h-[60vh]">
      <FadeIn>
        <p className="mb-4 font-mono text-xs tracking-label text-muted-foreground uppercase">
          {subtitle}
        </p>
      </FadeIn>
      <FadeIn>
        <h1 className="mb-6 max-w-2xl font-mono text-4xl font-light tracking-tight sm:text-5xl md:text-6xl">
          Archi
          <br />
          Curation
        </h1>
      </FadeIn>
      <Divider size="lg" className="mb-8" />
      <FadeIn>
        <p className="max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </FadeIn>
    </section>
  );
}
