import { Link } from "@/i18n/navigation";
import { StaggerContainer, StaggerItem } from "@/components/shared";

interface HomeEntryPointItem {
  title: string;
  description: string;
  href: string;
  count: string;
  exploreLabel: string;
}

interface HomeEntryPointsProps {
  items: HomeEntryPointItem[];
}

export function HomeEntryPoints({ items }: HomeEntryPointsProps) {
  return (
    <StaggerContainer className="grid gap-px border border-border sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StaggerItem key={item.href}>
          <Link
            href={item.href}
            className="group flex flex-col justify-between border border-border bg-background p-6 transition-all hover:bg-accent"
          >
            <div>
              <span className="mb-1 block font-mono text-micro text-muted-foreground">
                {item.count}
              </span>
              <h2 className="mb-2 font-mono text-lg tracking-wide transition-transform duration-200 group-hover:-translate-y-px">
                {item.title}
              </h2>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
            <div className="mt-6 font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
              {item.exploreLabel}
            </div>
          </Link>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
