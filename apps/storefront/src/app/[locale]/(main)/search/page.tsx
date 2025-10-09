import { getTranslations } from "next-intl/server";

import {
  type AllCurrency,
  ALLOWED_CURRENCY_CODES,
} from "@nimara/domain/consts";
import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";
import type {
  PageInfo,
  SearchContext,
} from "@nimara/infrastructure/use-cases/search/types";

import { DEFAULT_RESULTS_PER_PAGE, DEFAULT_SORT_BY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { saleorClient } from "@/graphql/client";
import { JsonLd, mappedSearchProductsToJsonLd } from "@/lib/json-ld";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { getSearchService } from "@/services/search";

import { Breadcrumbs } from "../../../../components/breadcrumbs";
import { ProductsList } from "../_components/products-list";
import { SearchPagination } from "../_components/search-pagination";
import { FiltersContainer } from "./_filters/filters-container";
import { NoResults } from "./_listing/no-results";
import { SearchSortBy } from "./_listing/search-sort-by";

type SearchParams = Promise<{
  after?: string;
  before?: string;
  category?: string;
  collection?: string;
  limit?: string;
  page?: string;
  q?: string;
  sortBy?: string;
}>;

export async function generateMetadata(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const canonicalUrl = new URL(
    paths.search.asPath(),
    clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
  ).toString();

  const t = await getTranslations("search");

  return {
    title: searchParams.q
      ? t("search-for", { query: searchParams.q })
      : t("all-products"),
    description: t("description"),
    openGraph: {
      images: [
        {
          url: "/og-hp.png",
          width: 1200,
          height: 630,
          alt: t("search-preview"),
        },
      ],
      url: canonicalUrl,
      siteName: "BestElectronics",
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  const [t, region, searchService] = await Promise.all([
    getTranslations(),
    getCurrentRegion(),
    getSearchService(),
  ]);

  const searchContext = {
    currency: region.market.currency,
    channel: region.market.channel,
    languageCode: region.language.code,
  } satisfies SearchContext;

  const {
    page,
    after,
    before,
    sortBy = DEFAULT_SORT_BY,
    q: query = "",
    limit,
    ...rest
  } = searchParams;
  const categorySlugs = rest.category
    ? rest.category
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean)
    : [];

  const [resultSearch, getFacetsResult, categoryLabels] = await Promise.all([
    searchService.search(
      {
        query,
        limit: limit ? Number.parseInt(limit) : DEFAULT_RESULTS_PER_PAGE,
        page,
        after,
        before,
        sortBy,
        filters: rest,
      },
      searchContext,
    ),
    searchService.getFacets(
      {
        query,
        filters: rest,
      },
      searchContext,
    ),
    fetchCategoryLabels(categorySlugs, searchContext.languageCode),
  ]);

  const resultOptions = searchService.getSortByOptions(searchContext);
  const options = resultOptions.ok ? resultOptions.data : [];

  const formattedCategoryLabels =
    categoryLabels.length > 0
      ? categoryLabels.map((label, index) => {
          if (label) {
            return label;
          }
          const slug = categorySlugs[index] ?? "";
          return formatSlugForHeader(slug);
        })
      : [];

  const formatList = (items: string[]) => {
    const cleaned = items.map((item) => item.trim()).filter(Boolean);

    if (!cleaned.length) {

      return null;
    }
    if (cleaned.length === 1) {

      return cleaned[0];
    }
    if (cleaned.length === 2) {

      return `${cleaned[0]} ${t("common.and")} ${cleaned[1]}`;
    }

    const last = cleaned[cleaned.length - 1];
    return `${cleaned.slice(0, -1).join(", ")} ${t("common.and")} ${last}`;
  };

  const getHeader = () => {
    if (query) {

      return t("search.results-for", { query });
    }

    const categoryHeader = formatList(formattedCategoryLabels);
    const collectionHeader = formatList(
      (searchParams.collection || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => formatSlugForHeader(value)),
    );

    if (!categoryHeader && !collectionHeader) {

      return t("search.all-products");
    }

    if (categoryHeader) {
      return categoryHeader;
    }
    if (collectionHeader) {
      return collectionHeader;
    }
  };

  const products = resultSearch.ok ? resultSearch.data.results : [];
  const pageInfo = resultSearch.ok ? resultSearch.data.pageInfo : null;

  let finalProducts = products;
  let finalPageInfo = pageInfo;

  if (!finalProducts.length && rest.category) {
    const fallbackResult = await fetchCategoryProducts({
      slug: categorySlugs[0] ?? rest.category,
      channel: searchContext.channel,
      languageCode: searchContext.languageCode,
      after,
      before,
      limit: limit ? Number.parseInt(limit) : DEFAULT_RESULTS_PER_PAGE,
    });

    if (fallbackResult) {
      finalProducts = fallbackResult.products;
      finalPageInfo = fallbackResult.pageInfo;
      if (
        formattedCategoryLabels.length === 0 &&
        fallbackResult.categoryLabel
      ) {
        formattedCategoryLabels.push(fallbackResult.categoryLabel);
      }
    }
  }

  return (
    <div className="w-full">
      <Breadcrumbs pageName={getHeader()} />
      <section className="mx-auto my-8 grid gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-slate-700 dark:text-primary text-2xl">
            {getHeader()}
          </h2>
          <div className="flex gap-4">
            <div className="hidden md:block">
              <SearchSortBy options={options} searchParams={searchParams} />
            </div>
            <FiltersContainer
              facets={getFacetsResult.ok ? getFacetsResult.data : []}
              searchParams={searchParams}
              sortByOptions={options}
            />
          </div>
        </div>

        {finalProducts.length ? (
          <ProductsList products={finalProducts} />
        ) : (
          <NoResults />
        )}

        {finalPageInfo && (
          <SearchPagination
            pageInfo={finalPageInfo}
            searchParams={searchParams}
            baseUrl={paths.search.asPath()}
          />
        )}
      </section>

      <JsonLd jsonLd={mappedSearchProductsToJsonLd(finalProducts)} />
    </div>
  );
}

function formatSlugForHeader(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function fetchCategoryLabels(
  slugs: string[],
  languageCode: string,
): Promise<(string | null)[]> {
  if (!slugs.length) {
    return [];
  }

  const query = {
    toString: () => `
      query CategoryLabelsQuery($slugs: [String!], $languageCode: LanguageCodeEnum!) {
        categories(first: 100, filter: { slugs: $slugs }) {
          edges {
            node {
              slug
              name
              translation(languageCode: $languageCode) {
                name
              }
            }
          }
        }
      }
    `,
  };

  const response = await saleorClient().execute(query, {
    operationName: "CategoryLabelsQuery",
    variables: {
      slugs,
      languageCode,
    },
  });

  if (!response.ok) {
    return slugs.map(() => null);
  }

  const edges: Array<{
    node?: {
      name?: string | null;
      slug?: string | null;
      translation?: { name?: string | null } | null;
    } | null;
  } | null> = response.data?.categories?.edges ?? [];
  const map = new Map<string, string>();

  edges.forEach((edge) => {
    const node = edge?.node;

    if (!node) {
      return;
    }
    const slug = node.slug ?? "";

    if (!slug) {
      return;
    }

    map.set(
      slug,
      node.translation?.name?.trim() ||
        node.name?.trim() ||
        slug.replace(/-/g, " "),
    );
  });

  return slugs.map((slug) => map.get(slug) ?? null);
}

type FallbackProductNode = {
  id: string;
  media?: Array<{ alt?: string | null; url: string }> | null;
  name: string;
  pricing: {
    displayGrossPrices: boolean;
    priceRange?: {
      start?: {
        gross?: { amount: number; currency: string } | null;
        net?: { amount: number; currency: string } | null;
      } | null;
    } | null;
    priceRangeUndiscounted?: {
      start?: {
        gross?: { amount: number; currency: string } | null;
        net?: { amount: number; currency: string } | null;
      } | null;
    } | null;
  };
  slug: string;
  thumbnail?: { alt?: string | null; url: string } | null;
  translation?: { name?: string | null } | null;
  updatedAt: string;
  variants?: Array<{
    pricing?: {
      price?: { gross?: { amount: number; currency: string } | null } | null;
    } | null;
  }> | null;
};

type FallbackCategoryProductsQuery = {
  category?: {
    name?: string | null;
    products?: {
      edges: Array<{ node: FallbackProductNode }>;
      pageInfo: {
        endCursor: string | null;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string | null;
      };
    } | null;
    translation?: { name?: string | null } | null;
  } | null;
};

const CATEGORY_PRODUCTS_FALLBACK_QUERY = {
  toString: () => `
    query CategoryProductsFallback(
      $slug: String!
      $channel: String!
      $languageCode: LanguageCodeEnum!
      $first: Int
      $after: String
      $before: String
    ) {
      category(slug: $slug) {
        name
        translation(languageCode: $languageCode) {
          name
        }
        products(
          channel: $channel
          first: $first
          after: $after
          before: $before
        ) {
          edges {
            node {
              id
              name
              slug
              translation(languageCode: $languageCode) {
                name
              }
              thumbnail(size: 256) {
                url
                alt
              }
              media {
                url
                alt
              }
              pricing {
                displayGrossPrices
                priceRange {
                  start {
                    gross {
                      amount
                      currency
                    }
                    net {
                      amount
                      currency
                    }
                  }
                }
                priceRangeUndiscounted {
                  start {
                    gross {
                      amount
                      currency
                    }
                    net {
                      amount
                      currency
                    }
                  }
                }
              }
              variants {
                pricing {
                  price {
                    gross {
                      amount
                      currency
                    }
                  }
                }
              }
              updatedAt
            }
          }
          pageInfo {
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
          }
        }
      }
    }
  `,
};

const FALLBACK_CURRENCY: AllCurrency = "USD";

const isAllowedCurrency = (
  currency: string | null | undefined,
): currency is AllCurrency =>
  typeof currency === "string" &&
  ALLOWED_CURRENCY_CODES.includes(currency as AllCurrency);

const normalizeCurrency = (
  ...candidates: Array<string | null | undefined>
): AllCurrency => {
  for (const candidate of candidates) {
    if (isAllowedCurrency(candidate)) {
      return candidate;
    }
  }

  return FALLBACK_CURRENCY;
};

const mapFallbackProduct = (node: FallbackProductNode): SearchProduct => {
  const displayGross = node.pricing.displayGrossPrices;
  const priceType = displayGross ? "gross" : "net";
  const priceRange = node.pricing.priceRange?.start;
  const undiscountedRange = node.pricing.priceRangeUndiscounted?.start;

  type MoneyRange = {
    gross?: { amount: number; currency: string } | null;
    net?: { amount: number; currency: string } | null;
  };

  const getPrice = (range?: MoneyRange | null) => {
    const money =
      priceType === "gross" ? range?.gross ?? null : range?.net ?? null;
    const currency = normalizeCurrency(
      money?.currency,
      range?.gross?.currency,
      range?.net?.currency,
      priceRange?.gross?.currency,
      priceRange?.net?.currency,
    );

    return {
      amount: money?.amount ?? 0,
      currency,
      type: priceType,
    } satisfies SearchProduct["price"];
  };

  const hasFreeVariant = node.variants?.some(
    (variant) => variant?.pricing?.price?.gross?.amount === 0,
  );

  const basePrice = getPrice(priceRange ?? undefined);
  const undiscountedPrice = getPrice(undiscountedRange ?? undefined);

  return {
    id: node.id,
    name: node.translation?.name?.trim() || node.name,
    slug: node.slug,
    price: hasFreeVariant ? { ...basePrice, amount: 0 } : basePrice,
    currency: basePrice.currency,
    undiscountedPrice,
    thumbnail: node.thumbnail
      ? {
          alt: node.thumbnail.alt ?? node.name,
          url: node.thumbnail.url,
        }
      : null,
    media: node.media?.map((media) => ({
      alt: media.alt ?? node.name,
      url: media.url,
    })) ?? null,
    updatedAt: new Date(node.updatedAt),
  } satisfies SearchProduct;
};

const fetchCategoryProducts = async ({
  after,
  before,
  channel,
  languageCode,
  limit,
  slug,
}: {
  after?: string;
  before?: string;
  channel: string;
  languageCode: string;
  limit: number;
  slug: string;
}): Promise<
  | {
      categoryLabel: string | null;
      pageInfo: Extract<PageInfo, { type: "cursor" }>;
      products: SearchProduct[];
    }
  | null
> => {
  const result = await saleorClient().execute(
    CATEGORY_PRODUCTS_FALLBACK_QUERY,
    {
      variables: {
        after,
        before,
        channel,
        first: before ? undefined : limit,
        languageCode,
        slug,
      },
      operationName: "CategoryProductsFallbackQuery",
    },
  );

  if (!result.ok) {
    return null;
  }

  const categoryNode = (result.data as FallbackCategoryProductsQuery).category;

  const productsConnection = categoryNode?.products;

  if (!productsConnection) {
    return null;
  }

  const products = productsConnection.edges.map(({ node }) =>
    mapFallbackProduct(node),
  );

  const pageInfo: Extract<PageInfo, { type: "cursor" }> = {
    after: productsConnection.pageInfo.endCursor,
    before: productsConnection.pageInfo.startCursor,
    hasNextPage: productsConnection.pageInfo.hasNextPage,
    hasPreviousPage: productsConnection.pageInfo.hasPreviousPage,
    type: "cursor",
  };

  const categoryLabel =
    categoryNode?.translation?.name?.trim() || categoryNode?.name?.trim() || null;

  return {
    categoryLabel,
    pageInfo,
    products,
  };
};
