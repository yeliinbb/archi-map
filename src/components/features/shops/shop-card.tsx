import { Link } from "@/i18n/navigation";
import { TagBadge } from "@/components/ui/tag-badge";
import { OptimizedImage } from "@/components/shared/optimized-image";
import type { Shop } from "@/types";

interface ShopCardProps {
  shop: Shop;
  cityName?: string;
}

export function ShopCard({ shop, cityName }: ShopCardProps) {
  return (
    <Link
      href={`/map/shops/${shop.slug}`}
      className="group block border border-border bg-background transition-colors hover:bg-accent"
    >
      {shop.images[0]?.src ? (
        <OptimizedImage
          src={shop.images[0].src}
          alt={shop.images[0].alt}
          fill
          aspectRatio="4/3"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-muted">
          <span className="font-mono text-micro text-muted-foreground uppercase">
            {shop.category}
          </span>
        </div>
      )}
      <div className="p-3">
        <div className="mb-1 flex items-center gap-2">
          <TagBadge variant="outline" className="text-micro">
            {shop.category}
          </TagBadge>
        </div>
        <h3 className="mb-1 truncate font-mono text-xs tracking-wide">
          {shop.name}
        </h3>
        {cityName ? (
          <p className="truncate font-mono text-micro text-muted-foreground">
            {cityName}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
