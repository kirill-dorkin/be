import { ChevronRight } from "lucide-react";
import { unstable_cache } from "next/cache";
import { getTranslations } from "next-intl/server";

import type { PageField } from "@nimara/domain/objects/CMSPage";
import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";
import type { SearchContext } from "@nimara/infrastructure/use-cases/search/types";
import { Button } from "@nimara/ui/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@nimara/ui/components/carousel";
import { Skeleton } from "@nimara/ui/components/skeleton";

import { SearchProductCard } from "@/components/search-product-card";
import { CACHE_TTL } from "@/config";
import { LocalizedLink } from "@/i18n/routing";
import { createFieldsMap, type FieldsMap } from "@/lib/cms";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { getSearchService } from "@/services/search";

const getHomepageProducts = unstable_cache(
  async (
    productIdsKey: string,
    currency: string,
    channel: string,
    languageCode: string,
  ): Promise<SearchProduct[]> => {
    const searchService = await getSearchService();

    const productIds =
      productIdsKey === "all" || productIdsKey.length === 0
        ? []
        : productIdsKey.split(",");

    const result = await searchService.search(
      {
        productIds,
        limit: 7,
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

  const searchContext = {
    currency: region.market.currency,
    channel: region.market.channel,
    languageCode: region.language.code,
  } satisfies SearchContext;

  if (!fields || fields.length === 0) {
    return null;
  }

  const fieldsMap: FieldsMap = createFieldsMap(fields);

  const header = fieldsMap["homepage-grid-item-header"]?.text;
  const subheader = fieldsMap["homepage-grid-item-subheader"]?.text;
  const image = fieldsMap["homepage-grid-item-image"]?.imageUrl;
  const buttonText = fieldsMap["homepage-button-text"]?.text;
  const headerFontColor =
    fieldsMap["homepage-grid-item-header-font-color"]?.text;
  const subheaderFontColor =
    fieldsMap["homepage-grid-item-subheader-font-color"]?.text;
  const gridProducts = fieldsMap["carousel-products"];

  const gridProductsIds = gridProducts?.reference;
  const productIdsArray: string[] = Array.isArray(gridProductsIds)
    ? gridProductsIds
    : gridProductsIds
      ? Array.from(gridProductsIds as Iterable<string>)
      : [];

  const products = await getHomepageProducts(
    productIdsArray.length ? productIdsArray.join(",") : "all",
    searchContext.currency,
    searchContext.channel,
    searchContext.languageCode,
  );

  if (!products.length) {
    return null;
  }

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          <div
            className="relative min-h-44 overflow-hidden rounded-3xl border border-neutral-200 bg-cover bg-center p-6 text-neutral-900 shadow-[0_18px_48px_rgba(15,23,42,0.08)] dark:border-white/10 dark:text-white dark:shadow-[0_28px_60px_rgba(0,0,0,0.35)]"
            style={{
              backgroundImage: `url(${image})`,
            }}
          >
            <h2
              className="text-2xl font-semibold leading-tight tracking-tight hyphens-auto break-words opacity-100"
              style={{
                color: `${headerFontColor ?? "#1c1917"}`,
              }}
            >
              {header}
            </h2>
            <h3
              className="mt-2 text-sm font-medium hyphens-auto break-words"
              style={{
                color: `${subheaderFontColor ?? "#57534e"}`,
              }}
            >
              {subheader}
            </h3>
            <Button
              className="absolute bottom-4 right-4 h-11 w-11 rounded-full p-0"
              variant="outline"
              asChild
              size="icon"
            >
              <LocalizedLink
                href={paths.search.asPath()}
                aria-label={t("search.all-products-link")}
              >
                <ChevronRight className="h-4 w-4" />
              </LocalizedLink>
            </Button>
          </div>
          {products.map((product) => (
            <div className="hidden sm:block" key={product.id}>
              <SearchProductCard
                product={product}
                sizes="(max-width: 720px) 1vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}

          <Carousel className="sm:hidden">
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem key={product.id} className="w-2/3 flex-none">
                  <SearchProductCard
                    product={product}
                    sizes="(max-width: 360px) 195px, (max-width: 720px) 379px, 1vw"
                    height={200}
                    width={200}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        <div className="mb-0 flex justify-center pb-8">
          <Button variant="outline" asChild>
            <LocalizedLink href={paths.search.asPath()}>
              {buttonText}
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
        <div className="mb-12 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          <div className="relative min-h-44 overflow-hidden rounded-3xl border border-neutral-200 bg-stone-200/60 p-6 dark:border-white/10 dark:bg-white/10">
            <Skeleton className="mb-2 h-6 w-1/2" />
            <Skeleton className="mb-4 h-4 w-1/3" />
            <Skeleton className="absolute bottom-4 right-4 h-11 w-11 rounded-full" />
          </div>

          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="hidden sm:block">
              <Skeleton className="aspect-[3/4] w-full rounded-md" />
            </div>
          ))}

          <Carousel className="sm:hidden">
            <CarouselContent>
              {Array.from({ length: 4 }).map((_, index) => (
                <CarouselItem key={index} className="w-2/3 flex-none">
                  <Skeleton className="aspect-square w-full rounded-md" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className="mb-14 flex justify-center">
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </div>
    </section>
  );
};
