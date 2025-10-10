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
  type RepairService,
  type RepairServiceCategory,
} from "@/lib/repair-services/data";
import type {
  SupportedCurrency,
  SupportedLocale,
} from "@/regions/types";

const formatPriceLabel = ({
  locale,
  currency,
  service,
  labels,
}: {
  currency: SupportedCurrency;
  labels: {
    fixed: string;
    from: string;
    range: string;
  };
  locale: SupportedLocale;
  service: RepairService;
}) => {
  const formatPrice = (amount: number) =>
    formatAsPrice({
      amount,
      currency,
      locale,
    });

  if (service.price.kind === "from" || service.price.max === null) {
    return labels.from.replace("{price}", formatPrice(service.price.min));
  }

  if (service.price.kind === "range" && service.price.max !== null) {
    return labels.range
      .replace("{min}", formatPrice(service.price.min))
      .replace("{max}", formatPrice(service.price.max));
  }

  return labels.fixed.replace("{price}", formatPrice(service.price.min));
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

export const ServicesSections = ({
  categories,
  currency,
  locale,
  strings,
}: {
  categories: RepairServiceCategory[];
  currency: SupportedCurrency;
  locale: SupportedLocale;
  strings: {
    catalogSubtitle: string;
    catalogTitle: string;
    cta: string;
    disclaimer: string;
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
                {category.name}
              </h3>
              {category.description && (
                <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                  {category.description}
                </p>
              )}
            </div>
            {category.services.map((service) => (
              <Card key={service.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <Badge variant="outline">
                      {formatBadgeLabel(service.price.kind, strings.price.badge)}
                    </Badge>
                  </div>
                  {service.shortDescription && (
                    <p className="text-muted-foreground text-sm">
                      {service.shortDescription}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-lg font-semibold">
                    {formatPriceLabel({
                      currency,
                      locale,
                      service,
                      labels: strings.price.label,
                    })}
                  </p>
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
            ))}
          </Fragment>
        ))}
      </div>
    </section>
  );
};
