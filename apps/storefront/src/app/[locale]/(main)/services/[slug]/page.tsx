import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Badge } from "@nimara/ui/components/badge";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatAsPrice } from "@/lib/formatters/util";
import { paths } from "@/lib/paths";
import {
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
}) => {
  const formatPrice = (amount: number) =>
    formatAsPrice({
      amount,
      currency: service.price.currency,
      locale,
    });

  if (service.price.kind === "from" || service.price.max === null) {
    return formatPrice(service.price.min);
  }

  if (service.price.kind === "range") {
    return `${formatPrice(service.price.min)} — ${formatPrice(service.price.max)}`;
  }

  return formatPrice(service.price.min);
};
const formatPriceLabel = ({
  serviceSlug,
  locale,
}: {
  locale: SupportedLocale;
  serviceSlug: string;
}) => {
  const service = repairServiceBySlug(serviceSlug);

  if (!service) {
    return null;
  }

  const { price } = service;
  const region = price.currency;

  const formatPrice = (amount: number) =>
    formatAsPrice({
      amount,
      currency: region,
      locale,
    });

  if (price.kind === "from" || price.max === null) {
    return {
      label: formatPrice(price.min),
      kind: "from",
    };
  }

  if (price.kind === "range") {
    return {
      label: `${formatPrice(price.min)} — ${formatPrice(price.max)}`,
      kind: "range",
    };
  }

  return {
    label: formatPrice(price.min),
    kind: "fixed",
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

        <section className="bg-muted/60 border-muted relative overflow-hidden rounded-3xl border px-6 py-10 sm:px-10">
          <div className="space-y-4">
            <Badge variant="outline">
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
            {formattedPrice && (
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-widest text-stone-500">
                  {t("detail.priceLabel")}
                </p>
                <p className="text-primary text-3xl font-bold">
                  {formattedPrice.label}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t(`catalog.priceBadge.${formattedPrice.kind}`)}
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
                      {t(`catalog.priceBadge.${item.price.kind}`)}
                    </span>
                    <span className="text-base font-medium">{item.name}</span>
                    <span className="text-muted-foreground text-sm">
                      {formatSiblingPrice({
                        service: item,
                        locale: region.language.locale,
                      })}
                    </span>
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
