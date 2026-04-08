import { getTranslations, setRequestLocale } from "next-intl/server";
import { getShops, getCityById } from "@/lib/data/data";
import { ShopCard } from "@/components/features/shops";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ShopsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shops");
  const shops = getShops();

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <FadeIn>
        <p className="mb-2 font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
          {t("label")}
        </p>
        <h1 className="mb-8 font-mono text-3xl font-light tracking-tight">
          {t("title")}
        </h1>
      </FadeIn>

      <StaggerContainer className="grid gap-px border border-border sm:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => {
          const city = getCityById(shop.cityId);
          return (
            <StaggerItem key={shop.id}>
              <ShopCard shop={shop} cityName={city?.name} />
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
