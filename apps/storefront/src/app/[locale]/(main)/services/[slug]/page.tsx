import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Badge } from "@nimara/ui/components/badge";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatAsPrice } from "@/lib/formatters/util";
import { paths } from "@/lib/paths";
import {
  type RepairPricingKind,
  type RepairService,
  repairServiceBySlug,
  repairServiceCatalog,
} from "@/lib/repair-services/data";
import { getCurrentRegion } from "@/regions/server";
import type { SupportedLocale } from "@/regions/types";

import { ServicesEstimator } from "../_components/services-estimator";

type PageProps = {
  params: Promise<{ locale: SupportedLocale, slug: string; }>;
};

const findCategoryByService = (slug: string) =>
  repairServiceCatalog.find((category) =>
    category.services.some((service) => service.slug === slug),
  );

const formatSiblingPrice = ({
  service,
  locale,
}: {
  locale: SupportedLocale;
  service: RepairService;
}): { isFree: boolean, label: string; } => {
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
};
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
}: {
  locale: SupportedLocale;
  serviceSlug: string;
}): {
  isFree: boolean;
  kind: "fixed" | "from" | "range";
  label: string;
} => {
  const service = repairServiceBySlug(serviceSlug);

  if (!service) {
    return {
      label: "",
      kind: "fixed",
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

  const isFree =
    price.min === 0 && (price.max === null || price.max === 0);

  if (price.kind === "from" || price.max === null) {
    return {
      label: formatPrice(price.min),
      kind: "from",
      isFree,
    };
  }

  if (price.kind === "range") {
    return {
      label: `${formatPrice(price.min)} — ${formatPrice(price.max)}`,
      kind: "range",
      isFree,
    };
  }

  return {
    label: formatPrice(price.min),
    kind: "fixed",
    isFree,
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
  const [region, t] = await Promise.all([
    getCurrentRegion(),
    getTranslations("services"),
  ]);

  const service = repairServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const category = findCategoryByService(slug);

  const siblings =
    category?.services.filter((item) => item.slug !== service.slug) ?? [];

  const formattedPrice = formatPriceLabel({
    serviceSlug: service.slug,
    locale: region.language.locale,
  });

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

        <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 via-background to-background px-6 py-10 sm:px-10">
          <div className="pointer-events-none absolute -left-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

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
              <div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {t("detail.priceLabel")}
                </p>
                {formattedPrice.isFree ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-sm line-through">
                      {formattedPrice.label}
                    </span>
                    <span className="text-emerald-600 text-3xl font-semibold">
                      {t("catalog.freeLabel")}
                    </span>
                  </div>
                ) : (
                  <p className="text-primary text-3xl font-bold">
                    {formattedPrice.label}
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
                          <span className="text-emerald-600 font-semibold">
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
