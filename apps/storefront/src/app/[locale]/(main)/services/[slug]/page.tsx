import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Badge } from "@nimara/ui/components/badge";

import { getAccessToken } from "@/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatAsPrice } from "@/lib/formatters/util";
import { paths } from "@/lib/paths";
import {
  applyRepairDiscount,
  calculateRepairSavings,
  getRepairDiscountForUser,
  toDiscountPercent,
} from "@/lib/repair/discount";
import {
  type RepairPricingKind,
  type RepairService,
  repairServiceBySlug,
  repairServiceCatalog,
} from "@/lib/repair-services/data";
import { getCurrentRegion } from "@/regions/server";
import type { SupportedLocale } from "@/regions/types";
import { getUserService } from "@/services/user";

import { ServicesEstimator } from "../_components/services-estimator";

type PageProps = {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
};

function findCategoryByService(slug: string) {
  return repairServiceCatalog.find((category) =>
    category.services.some((service) => service.slug === slug),
  );
}

function formatSiblingPrice({
  service,
  locale,
}: {
  locale: SupportedLocale;
  service: RepairService;
}): { isFree: boolean; label: string } {
  const formatPrice = (amount: number) =>
    formatAsPrice({
      amount,
      currency: service.price.currency,
      locale,
    });

  const isFree =
    service.price.min === 0 &&
    (service.price.max === null || service.price.max === 0);

  if (service.price.kind === "from" || service.price.max === null) {
    return {
      label: formatPrice(service.price.min),
      isFree,
    };
  }

  if (service.price.kind === "range") {
    return {
      label: `${formatPrice(service.price.min)} — ${formatPrice(service.price.max)}`,
      isFree,
    };
  }

  return {
    label: formatPrice(service.price.min),
    isFree,
  };
}

type PriceBadgeMessageKey =
  | "catalog.priceBadge.fixed"
  | "catalog.priceBadge.from"
  | "catalog.priceBadge.range";

const priceBadgeKeyMap: Record<RepairPricingKind, PriceBadgeMessageKey> = {
  fixed: "catalog.priceBadge.fixed",
  from: "catalog.priceBadge.from",
  range: "catalog.priceBadge.range",
};

const formatPriceLabel = ({
  serviceSlug,
  locale,
  discountRate,
}: {
  discountRate?: number;
  locale: SupportedLocale;
  serviceSlug: string;
}): {
  discountedLabel?: string;
  isDiscounted: boolean;
  isFree: boolean;
  kind: "fixed" | "from" | "range";
  label: string;
  savingsAmount: number;
} => {
  const service = repairServiceBySlug(serviceSlug);

  if (!service) {
    return {
      label: "",
      kind: "fixed",
      discountedLabel: undefined,
      isDiscounted: false,
      savingsAmount: 0,
      isFree: false,
    };
  }

  const { price } = service;
  const region = price.currency;

  const formatPrice = (amount: number) =>
    formatAsPrice({
      amount,
      currency: region,
      locale,
    });

  const isFree = price.min === 0 && (price.max === null || price.max === 0);

  const buildLabel = (min: number, max: number | null) => {
    if (price.kind === "from" || max === null) {
      return formatPrice(min);
    }

    if (price.kind === "range" && max !== null) {
      return `${formatPrice(min)} — ${formatPrice(max)}`;
    }

    return formatPrice(min);
  };

  const baseLabel = buildLabel(price.min, price.max);

  if (isFree || !discountRate) {
    return {
      label: baseLabel,
      discountedLabel: undefined,
      kind: price.kind,
      isFree,
      isDiscounted: false,
      savingsAmount: 0,
    };
  }

  const discountedMin = applyRepairDiscount(price.min, discountRate);
  const discountedMax =
    price.max !== null ? applyRepairDiscount(price.max, discountRate) : null;

  const minSavings = calculateRepairSavings(price.min, discountRate);
  const maxSavings =
    price.max !== null ? calculateRepairSavings(price.max, discountRate) : 0;

  const hasDiscount = minSavings > 0 || maxSavings > 0;

  if (!hasDiscount) {
    return {
      label: baseLabel,
      discountedLabel: undefined,
      kind: price.kind,
      isFree,
      isDiscounted: false,
      savingsAmount: 0,
    };
  }

  return {
    label: baseLabel,
    discountedLabel: buildLabel(discountedMin, discountedMax),
    kind: price.kind,
    isFree,
    isDiscounted: true,
    savingsAmount: minSavings,
  };
};

export async function generateStaticParams() {
  return repairServiceCatalog
    .flatMap((category) => category.services)
    .map((service) => ({
      slug: service.slug,
    }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = repairServiceBySlug(slug);
  const t = await getTranslations("services.meta");

  if (!service) {
    return {
      title: t("notFoundTitle"),
      description: t("notFoundDescription"),
    };
  }

  return {
    title: t("serviceTitle", { service: service.name }),
    description: service.shortDescription ?? t("description"),
  };
}

export default async function ServiceDetails({ params }: PageProps) {
  const { slug } = await params;
  const [accessToken, region, userService, t] = await Promise.all([
    getAccessToken(),
    getCurrentRegion(),
    getUserService(),
    getTranslations("services"),
  ]);

  const service = repairServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const resultUserGet = await userService.userGet(accessToken);
  const user = resultUserGet.ok ? resultUserGet.data : null;

  const repairDiscount = getRepairDiscountForUser(user);
  const discountPercent = repairDiscount
    ? toDiscountPercent(repairDiscount.percentage)
    : null;

  const isVipDiscount = repairDiscount?.reason === "vip-customer";
  const discountStrings = repairDiscount
    ? {
        badge: t("catalog.discountBadge", { percent: discountPercent }),
        caption: isVipDiscount
          ? t("catalog.discountCaptionVip", { percent: discountPercent })
          : t("catalog.discountCaptionRegistered", {
              percent: discountPercent,
            }),
        tierLabel: isVipDiscount ? t("catalog.vipBadgeLabel") : undefined,
      }
    : null;

  const category = findCategoryByService(slug);

  const siblings =
    category?.services.filter((item) => item.slug !== service.slug) ?? [];

  const formattedPrice = formatPriceLabel({
    serviceSlug: service.slug,
    locale: region.language.locale,
    discountRate: repairDiscount?.percentage,
  });

  const savingsLabel =
    formattedPrice.isDiscounted && formattedPrice.savingsAmount > 0
      ? t("calculator.discountSavings", {
          amount: formatAsPrice({
            amount: formattedPrice.savingsAmount,
            currency: service.price.currency,
            locale: region.language.locale,
          }),
        })
      : null;

  return (
    <div className="bg-background">
      <div className="container space-y-10 py-10 lg:space-y-14 lg:py-16">
        <Breadcrumbs
          pageName={service.name}
          crumbs={[
            {
              href: paths.services.asPath(),
              label: t("detail.breadcrumbServices"),
            },
          ]}
        />

        <section className="border-primary/10 from-primary/10 via-background to-background relative overflow-hidden rounded-3xl border bg-gradient-to-br px-6 py-10 sm:px-10">
          <div className="bg-primary/20 pointer-events-none absolute -left-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full blur-3xl" />
          <div className="bg-primary/10 pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full blur-3xl" />

          <div className="relative space-y-4">
            <Badge variant="outline" className="bg-background/80">
              {t(`deviceLabels.${service.deviceType}`)}
            </Badge>
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              {service.name}
            </h1>
            {service.shortDescription && (
              <p className="text-muted-foreground max-w-3xl text-lg">
                {service.shortDescription}
              </p>
            )}
            {formattedPrice.label && (
              <div className="border-primary/20 bg-primary/5 space-y-2 rounded-2xl border p-5 shadow-sm">
                <p className="text-primary text-xs font-semibold uppercase tracking-widest">
                  {t("detail.priceLabel")}
                </p>
                {formattedPrice.isFree ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-sm line-through">
                      {formattedPrice.label}
                    </span>
                    <span className="text-3xl font-semibold text-emerald-600">
                      {t("catalog.freeLabel")}
                    </span>
                  </div>
                ) : formattedPrice.isDiscounted && discountStrings ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-sm line-through">
                      {formattedPrice.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-semibold text-emerald-600">
                        {formattedPrice.discountedLabel}
                      </span>
                      <div className="flex items-center gap-1">
                        <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                          {discountStrings.badge}
                        </Badge>
                        {discountStrings.tierLabel && (
                          <Badge className="border-amber-500/30 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-900/30 dark:text-amber-100">
                            {discountStrings.tierLabel}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {savingsLabel && (
                      <span className="text-sm font-medium text-emerald-700">
                        {savingsLabel}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-primary text-3xl font-bold">
                    {formattedPrice.label}
                  </p>
                )}
                {formattedPrice.isDiscounted && discountStrings && (
                  <p className="text-sm font-medium text-emerald-700">
                    {discountStrings.caption}
                  </p>
                )}
                <p className="text-muted-foreground text-sm">
                  {t(priceBadgeKeyMap[formattedPrice.kind])}
                </p>
              </div>
            )}
          </div>
        </section>

        <section id="service-request">
          <ServicesEstimator
            catalog={repairServiceCatalog}
            currency={region.market.currency}
            locale={region.language.locale}
            initialServiceSlug={service.slug}
            repairDiscount={repairDiscount ?? undefined}
          />
        </section>

        {siblings.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-foreground text-2xl font-semibold">
              {t("detail.related", { category: category?.name ?? "" })}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {siblings.slice(0, 6).map((item) => (
                <li
                  key={item.id}
                  className="border-muted hover:border-primary/40 hover:bg-primary/5 rounded-lg border px-4 py-3 transition"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-stone-500">
                      {t(priceBadgeKeyMap[item.price.kind])}
                    </span>
                    <span className="text-base font-medium">{item.name}</span>
                    {(() => {
                      const siblingPrice = formatSiblingPrice({
                        service: item,
                        locale: region.language.locale,
                      });

                      if (!siblingPrice.isFree) {
                        return (
                          <span className="text-muted-foreground text-sm">
                            {siblingPrice.label}
                          </span>
                        );
                      }

                      return (
                        <span className="text-sm">
                          <span className="text-muted-foreground mr-2 line-through">
                            {siblingPrice.label}
                          </span>
                          <span className="font-semibold text-emerald-600">
                            {t("catalog.freeLabel")}
                          </span>
                        </span>
                      );
                    })()}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
