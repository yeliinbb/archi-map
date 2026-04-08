import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getShopBySlug, getShops, getCityById } from "@/lib/data/data";
import { TagBadge } from "@/components/ui/tag-badge";
import { Divider } from "@/components/ui/divider";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  return getShops().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = getShopBySlug(slug);
  if (!shop) return { title: "Not Found" };
  return { title: shop.name };
}

export default async function ShopDetailPage({ params }: Props) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const shop = getShopBySlug(slug);
  if (!shop) notFound();

  const city = getCityById(shop.cityId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <Link
        href="/map/shops"
        className="mb-8 inline-block font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("shops.back")}
      </Link>

      <div className="mb-3 flex items-center gap-2">
        <TagBadge variant="outline">{shop.category}</TagBadge>
      </div>

      <h1 className="mb-1 font-mono text-3xl font-light tracking-tight">
        {shop.name}
      </h1>
      {shop.nameKo ? (
        <p className="mb-4 text-sm text-muted-foreground">{shop.nameKo}</p>
      ) : null}
      <Divider className="mb-8" />

      <p className="mb-8 font-mono text-sm leading-relaxed text-muted-foreground">
        {shop.description}
      </p>

      <div className="mb-8 space-y-3 border-l border-border pl-4">
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
        <div>
          <span className="font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
            {t("detail.address")}
          </span>
          <p className="font-mono text-sm">{shop.address}</p>
        </div>
        {shop.openingHours ? (
          <div>
            <span className="font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
              {t("shops.hours")}
            </span>
            <p className="font-mono text-sm">{shop.openingHours}</p>
          </div>
        ) : null}
        {shop.website ? (
          <div>
            <span className="font-mono text-micro tracking-wider text-muted-foreground/60 uppercase">
              {t("detail.website")}
            </span>
            <p className="font-mono text-sm">
              <a
                href={shop.website}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                {shop.website} ↗
              </a>
            </p>
          </div>
        ) : null}
      </div>

      {shop.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {shop.tags.map((tag) => (
            <TagBadge key={tag.slug}>{tag.label}</TagBadge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
