import { ChevronRight } from "lucide-react";
import { unstable_cache } from "next/cache";
import { getTranslations } from "next-intl/server";

import type { PageField } from "@nimara/domain/objects/CMSPage";
import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";
import type { SearchContext } from "@nimara/infrastructure/use-cases/search/types";
import { Button } from "@nimara/ui/components/button";
import { Skeleton } from "@nimara/ui/components/skeleton";

import { OptimizedImage } from "@/components/optimized-image";
import { CACHE_TTL } from "@/config";
import { LocalizedLink } from "@/i18n/routing";
import { createFieldsMap, type FieldsMap } from "@/lib/cms";
import { formatProductName } from "@/lib/format-product-name";
import { localizedFormatter } from "@/lib/formatters/util";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { type SupportedCurrency } from "@/regions/types";
import { getSearchService } from "@/services/search";

const HOMEPAGE_PRODUCT_LIMIT = 4;

const getHomepageProducts = unstable_cache(
  async (
    productIdsKey: string,
    currency: string,
    channel: string,
    languageCode: string,
    limit: number,
  ): Promise<SearchProduct[]> => {
    const searchService = await getSearchService();

    const productIds =
      productIdsKey === "all" || productIdsKey.length === 0
        ? []
        : productIdsKey.split(",");

    const result = await searchService.search(
      {
        productIds,
        limit,
      },
      {
        currency,
        channel,
        languageCode,
      },
    );

    return result.ok ? result.data.results : [];
  },
  ["homepage-products"],
  {
    revalidate: CACHE_TTL.cms,
    tags: ["search:homepage-products"],
  },
);

export const ProductsGrid = async ({
  fields,
}: {
  fields: PageField[] | undefined;
}) => {
  const [region, t] = await Promise.all([
    getCurrentRegion(),
    getTranslations(),
  ]);
  const formatter = localizedFormatter({ region });

  const searchContext = {
    currency: region.market.currency,
    channel: region.market.channel,
    languageCode: region.language.code,
  } satisfies SearchContext;

  const fieldsMap: FieldsMap = fields ? createFieldsMap(fields) : {};

  const buttonText = fieldsMap["homepage-button-text"]?.text;
  const gridProducts = fieldsMap["carousel-products"];

  const gridProductsIds = gridProducts?.reference;
  const productIdsArray: string[] = Array.isArray(gridProductsIds)
    ? gridProductsIds
    : gridProductsIds
      ? Array.from(gridProductsIds as Iterable<string>)
      : [];

  const requestedLimit =
    productIdsArray.length > 0
      ? Math.min(productIdsArray.length, HOMEPAGE_PRODUCT_LIMIT)
      : HOMEPAGE_PRODUCT_LIMIT;

  const requestedKey = productIdsArray.length
    ? productIdsArray.join(",")
    : "all";

  let products = await getHomepageProducts(
    requestedKey,
    searchContext.currency,
    searchContext.channel,
    searchContext.languageCode,
    requestedLimit,
  );

  if (!products.length && requestedKey !== "all") {
    products = await getHomepageProducts(
      "all",
      searchContext.currency,
      searchContext.channel,
      searchContext.languageCode,
      HOMEPAGE_PRODUCT_LIMIT,
    );
  }

  if (!products.length) {
    return null;
  }

  const formatPriceLabel = (
    price?: SearchProduct["price"] | SearchProduct["undiscountedPrice"] | null,
  ) => {
    if (!price || price.amount === 0) {
      return t("common.free");
    }

    return formatter.price({
      amount: price.amount,
      currency: price.currency as SupportedCurrency,
    });
  };

  const visibleProducts = products.slice(0, HOMEPAGE_PRODUCT_LIMIT);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {visibleProducts.map((product) => {
            const href = paths.products.asPath({ slug: product.slug });
            const hasDiscount =
              product.undiscountedPrice &&
              product.undiscountedPrice.amount > product.price.amount;
            const displayPrice = formatPriceLabel(product.price);
            const oldPrice = hasDiscount
              ? formatPriceLabel(product.undiscountedPrice)
              : null;
            const initial =
              product.name?.trim().charAt(0)?.toUpperCase() ?? product.slug[0];

            return (
              <div
                key={product.id}
                className="border-border/40 bg-card/60 hover:border-border hover:bg-card rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <LocalizedLink
                  href={href}
                  className="group flex h-full flex-col gap-3"
                  aria-label={product.name}
                >
                  <div className="border-border/50 bg-muted/30 relative aspect-square overflow-hidden rounded-xl border p-2">
                    {product.thumbnail ? (
                      <OptimizedImage
                        src={product.thumbnail.url}
                        alt={product.thumbnail.alt || product.name}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 20vw, 200px"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        priority={false}
                        disableGoogleLens
                      />
                    ) : (
                      <div className="from-muted via-muted/70 to-muted/40 text-muted-foreground flex h-full items-center justify-center rounded-xl bg-gradient-to-tr text-2xl font-semibold">
                        {initial}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground line-clamp-2 text-sm font-semibold leading-snug">
                      {formatProductName(product.name)}
                    </p>
                    <div className="text-foreground flex items-baseline gap-2 text-sm">
                      {oldPrice ? (
                        <span className="text-muted-foreground text-xs line-through">
                          {oldPrice}
                        </span>
                      ) : null}
                      <span className="text-base font-semibold">
                        {displayPrice}
                      </span>
                    </div>
                  </div>
                </LocalizedLink>
              </div>
            );
          })}
        </div>
        <div className="mt-10 flex justify-center pb-4">
          <Button variant="outline" asChild>
            <LocalizedLink href={paths.search.asPath()}>
              {buttonText ?? t("search.all-products")}
              <ChevronRight className="h-4 w-5 pl-1" />
            </LocalizedLink>
          </Button>
        </div>
      </div>
    </section>
  );
};

export const ProductsGridSkeleton = () => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: HOMEPAGE_PRODUCT_LIMIT }).map((_, index) => (
            <div
              key={index}
              className="border-border/40 bg-card/40 rounded-2xl border p-4"
            >
              <Skeleton className="mb-3 aspect-square w-full rounded-xl" />
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center pb-4">
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </div>
    </section>
  );
};
