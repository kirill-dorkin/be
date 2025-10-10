import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { repairServiceCatalog } from "@/lib/repair-services/data";
import { getCurrentRegion } from "@/regions/server";
import type { SupportedLocale } from "@/regions/types";

import { ServicesEstimator } from "./_components/services-estimator";
import { ServicesSections } from "./_components/services-sections";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export async function generateMetadata(
  _props: PageProps,
): Promise<Metadata> {
  const t = await getTranslations("services.meta");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ServicesPage() {
  const [region, t] = await Promise.all([
    getCurrentRegion(),
    getTranslations("services"),
  ]);

  const catalog = repairServiceCatalog;

  return (
    <div className="bg-background">
      <div className="container space-y-12 py-12 lg:py-16">
        <section className="bg-muted/60 border-muted mx-auto w-full max-w-5xl rounded-3xl border px-6 py-12 text-center sm:px-10">
          <span className="text-primary inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest">
            {t("hero.overline")}
          </span>
          <h1 className="text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <LocalizedLink href="#service-request">
                {t("hero.primaryCta")}
              </LocalizedLink>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <LocalizedLink href={paths.search.asPath()}>
                {t("hero.secondaryCta")}
              </LocalizedLink>
            </Button>
          </div>
        </section>

        <section id="services-catalog">
          <ServicesSections
            categories={catalog}
            currency={region.market.currency}
            locale={region.language.locale}
            strings={{
              catalogTitle: t("catalog.title"),
              catalogSubtitle: t("catalog.subtitle"),
              price: {
                badge: {
                  fixed: t("catalog.priceBadge.fixed"),
                  from: t("catalog.priceBadge.from"),
                  range: t("catalog.priceBadge.range"),
                },
                label: {
                  fixed: t("catalog.priceLabel.fixed"),
                  from: t("catalog.priceLabel.from"),
                  range: t("catalog.priceLabel.range"),
                },
              },
              cta: t("catalog.action"),
              disclaimer: t("catalog.disclaimer"),
            }}
          />
        </section>

        <section id="service-request">
          <ServicesEstimator
            catalog={catalog}
            currency={region.market.currency}
            locale={region.language.locale}
          />
        </section>
      </div>
    </div>
  );
}
