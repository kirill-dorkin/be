import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";

import { Button } from "@nimara/ui/components/button";

import { getAccessToken } from "@/auth";
import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import {
  getRepairDiscountForUser,
  toDiscountPercent,
} from "@/lib/repair/discount";
import { repairServiceCatalog } from "@/lib/repair-services/data";
import { getCurrentRegion } from "@/regions/server";
import type { SupportedLocale } from "@/regions/types";
import { getUserService } from "@/services/user";

import { ScrollToEstimatorButton } from "./_components/scroll-to-estimator-button";
import { ServicesSections } from "./_components/services-sections";

export const revalidate = 60 * 60; // 1 hour cache for services catalog

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

const ServicesEstimator = dynamic(
  () => import("./_components/services-estimator").then((mod) => mod.ServicesEstimator),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-2xl border border-border/50 bg-muted/30 p-6"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="h-4 w-32 rounded bg-muted-foreground/20" />
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded bg-muted-foreground/15" />
          <div className="h-3 w-3/4 rounded bg-muted-foreground/15" />
        </div>
      </div>
    ),
  },
);

export default async function ServicesPage() {
  const [accessToken, region, userService, t] = await Promise.all([
    getAccessToken(),
    getCurrentRegion(),
    getUserService(),
    getTranslations("services"),
  ]);

  const user = await (async () => {
    try {
      const resultUserGet = await userService.userGet(accessToken);
      return resultUserGet.ok ? resultUserGet.data : null;
    } catch (error) {
      console.error("[ServicesPage] Failed to fetch user", error);
      return null;
    }
  })();

  const catalog = repairServiceCatalog;
  const repairDiscount = getRepairDiscountForUser(user);
  const discountPercent = repairDiscount
    ? toDiscountPercent(repairDiscount.percentage)
    : null;
  const isVipDiscount = repairDiscount?.reason === "vip-customer";
  const catalogDiscountStrings = repairDiscount
    ? {
        badge: t("catalog.discountBadge", { percent: discountPercent }),
        caption: isVipDiscount
          ? t("catalog.discountCaptionVip", { percent: discountPercent })
          : t("catalog.discountCaptionRegistered", {
              percent: discountPercent,
            }),
        savings: t.raw("catalog.discountSavings"),
        tierLabel: isVipDiscount ? t("catalog.vipBadgeLabel") : undefined,
      }
    : null;

  return (
    <div className="bg-background overflow-x-hidden">
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

        <section id="services-catalog" className="w-full max-w-full">
          <ServicesSections
            categories={catalog}
            currency={region.market.currency}
            locale={region.language.locale}
            discountRate={repairDiscount?.percentage}
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
                  fixed: t.raw("catalog.priceLabel.fixed"),
                  from: t.raw("catalog.priceLabel.from"),
                  range: t.raw("catalog.priceLabel.range"),
                },
              },
              freeLabel: t("catalog.freeLabel"),
              cta: t("catalog.action"),
              disclaimer: t("catalog.disclaimer"),
              discount: catalogDiscountStrings,
            }}
          />
        </section>

        <section id="service-request" className="w-full max-w-full overflow-hidden">
          <ServicesEstimator
            catalog={catalog}
            currency={region.market.currency}
            locale={region.language.locale}
            repairDiscount={repairDiscount ?? undefined}
          />
        </section>
      </div>

      <ScrollToEstimatorButton />
    </div>
  );
}
