import { Fragment } from "react";

import { Badge } from "@nimara/ui/components/badge";
import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { LocalizedLink } from "@/i18n/routing";
import { formatAsPrice } from "@/lib/formatters/util";
import { paths } from "@/lib/paths";
import {
  applyRepairDiscount,
  calculateRepairSavings,
} from "@/lib/repair/discount";
import {
  type RepairService,
  type RepairServiceCategory,
} from "@/lib/repair-services/data";
import {
  getRepairCategoryLabel,
  getRepairServiceDescription,
  getRepairServiceLabel,
} from "@/lib/repair-services/translations";
import type {
  SupportedCurrency,
  SupportedLocale,
} from "@/regions/types";

type PriceLabels = {
  fixed: string;
  from: string;
  range: string;
};

type PriceDisplay = {
  discountedLabel?: string;
  isDiscounted: boolean;
  isFree: boolean;
  label: string;
  savingsAmount: number;
};

const formatPriceLabel = ({
  locale,
  currency,
  service,
  labels,
  discountRate,
}: {
  currency: SupportedCurrency;
  discountRate?: number;
  labels: PriceLabels;
  locale: SupportedLocale;
  service: RepairService;
}): PriceDisplay => {
  const formatPrice = (amount: number) =>
    formatAsPrice({
      amount,
      currency,
      locale,
    });

  const isFree =
    service.price.min === 0 &&
    (service.price.max === null || service.price.max === 0);

  const buildLabel = (min: number, max: number | null) => {
    if (service.price.kind === "from" || max === null) {
      return labels.from.replace("{price}", formatPrice(min));
    }

    if (service.price.kind === "range" && max !== null) {
      return labels.range
        .replace("{min}", formatPrice(min))
        .replace("{max}", formatPrice(max));
    }

    return labels.fixed.replace("{price}", formatPrice(min));
  };

  const baseLabel = buildLabel(service.price.min, service.price.max);

  if (isFree) {
    return {
      label: baseLabel,
      discountedLabel: undefined,
      isDiscounted: false,
      isFree: true,
      savingsAmount: 0,
    };
  }

  if (!discountRate) {
    return {
      label: baseLabel,
      discountedLabel: undefined,
      isDiscounted: false,
      isFree: false,
      savingsAmount: 0,
    };
  }

  const discountedMin = applyRepairDiscount(
    service.price.min,
    discountRate,
  );
  const discountedMax =
    service.price.max !== null
      ? applyRepairDiscount(service.price.max, discountRate)
      : null;

  const minSavings = calculateRepairSavings(
    service.price.min,
    discountRate,
  );
  const maxSavings =
    service.price.max !== null
      ? calculateRepairSavings(service.price.max, discountRate)
      : 0;

  const hasDiscount = minSavings > 0 || maxSavings > 0;

  if (!hasDiscount) {
    return {
      label: baseLabel,
      discountedLabel: undefined,
      isDiscounted: false,
      isFree: false,
      savingsAmount: 0,
    };
  }

  const discountedLabel = buildLabel(discountedMin, discountedMax);

  return {
    label: baseLabel,
    discountedLabel,
    isDiscounted: true,
    isFree: false,
    savingsAmount: minSavings,
  };
};

const formatBadgeLabel = (
  priceKind: RepairService["price"]["kind"],
  strings: {
    fixed: string;
    from: string;
    range: string;
  },
) => {
  switch (priceKind) {
    case "from":
      return strings.from;
    case "range":
      return strings.range;
    default:
      return strings.fixed;
  }
};

type DiscountStrings = {
  badge: string;
  caption: string;
  savings: string;
} | null;

export const ServicesSections = ({
  categories,
  currency,
  locale,
  strings,
  discountRate,
}: {
  categories: RepairServiceCategory[];
  currency: SupportedCurrency;
  discountRate?: number;
  locale: SupportedLocale;
  strings: {
    catalogSubtitle: string;
    catalogTitle: string;
    cta: string;
    disclaimer: string;
    discount: DiscountStrings;
    freeLabel: string;
    price: {
      badge: {
        fixed: string;
        from: string;
        range: string;
      };
      label: {
        fixed: string;
        from: string;
        range: string;
      };
    };
  };
}) => {
  const discountStrings = strings.discount;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-foreground text-3xl font-semibold">
          {strings.catalogTitle}
        </h2>
        <p className="text-muted-foreground max-w-3xl">
          {strings.catalogSubtitle}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {categories.map((category) => (
          <Fragment key={category.id}>
            <div className="col-span-full">
              <h3 className="text-primary text-xl font-semibold">
                {getRepairCategoryLabel(category.name, locale)}
              </h3>
              {category.description && (
                <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                  {category.description}
                </p>
              )}
            </div>
            {category.services.map((service) => {
              const priceInfo = formatPriceLabel({
                currency,
                locale,
                service,
                labels: strings.price.label,
                discountRate,
              });

              const savingsLabel =
                priceInfo.isDiscounted &&
                discountStrings &&
                priceInfo.savingsAmount > 0
                  ? discountStrings.savings.replace(
                      "{amount}",
                      formatAsPrice({
                        amount: priceInfo.savingsAmount,
                        currency,
                        locale,
                      }),
                    )
                  : null;

              return (
                <Card key={service.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="text-xl">
                        {getRepairServiceLabel(service.name, locale)}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {formatBadgeLabel(
                            service.price.kind,
                            strings.price.badge,
                          )}
                        </Badge>
                        {priceInfo.isDiscounted && discountStrings && (
                          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                            {discountStrings.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {service.shortDescription && (
                      <p className="text-muted-foreground text-sm">
                        {getRepairServiceDescription(
                          service.shortDescription,
                          locale,
                        )}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-lg font-semibold">
                      {priceInfo.isFree ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-sm font-normal line-through">
                            {priceInfo.label}
                          </span>
                          <span className="text-emerald-600 text-lg font-semibold">
                            {strings.freeLabel}
                          </span>
                        </div>
                      ) : priceInfo.isDiscounted &&
                        discountStrings &&
                        priceInfo.discountedLabel ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-sm font-normal line-through">
                            {priceInfo.label}
                          </span>
                          <span className="text-emerald-600 text-lg font-semibold">
                            {priceInfo.discountedLabel}
                          </span>
                          {savingsLabel && (
                            <span className="text-emerald-700 text-xs font-medium">
                              {savingsLabel}
                            </span>
                          )}
                        </div>
                      ) : (
                        priceInfo.label
                      )}
                    </div>
                    {priceInfo.isDiscounted && discountStrings && (
                      <p className="text-emerald-700 mt-2 text-xs font-medium">
                        {discountStrings.caption}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-2 text-xs">
                      {strings.disclaimer}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button asChild variant="secondary">
                      <LocalizedLink
                        href={paths.services.detail.asPath({
                          slug: service.slug,
                        })}
                      >
                        {strings.cta}
                      </LocalizedLink>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </Fragment>
        ))}
      </div>
    </section>
  );
};
