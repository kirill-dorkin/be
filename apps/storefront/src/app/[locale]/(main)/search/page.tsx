import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import {
  type AllCurrency,
  ALLOWED_CURRENCY_CODES,
} from "@nimara/domain/consts";
import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";
import type {
  PageInfo,
  SearchContext,
  SearchService,
} from "@nimara/infrastructure/use-cases/search/types";

import {
  CACHE_TTL,
  DEFAULT_RESULTS_PER_PAGE,
  DEFAULT_SORT_BY,
} from "@/config";
import { clientEnvs } from "@/envs/client";
import { saleorClient } from "@/graphql/client";
import { JsonLd, mappedSearchProductsToJsonLd } from "@/lib/json-ld";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { getSearchService } from "@/services/search";
import { type SortByOption } from "@nimara/domain/objects/Search";

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

const CACHE_TAGS = {
  categoryLabels: "search:category-labels",
  categoryProducts: "search:category-products",
  facets: "search:facets",
  results: "search:results",
} as const;

const stableJSONStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    const primitive = JSON.stringify(value);

    return primitive === undefined ? "null" : primitive;
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJSONStringify(item)).join(",")}]`;
  }

  const entries = Object.keys(value as Record<string, unknown>)
    .filter((key) => {
      const entry = (value as Record<string, unknown>)[key];

      return typeof entry !== "undefined" && typeof entry !== "function";
    })
    .sort()
    .map((key) => {
      const entry = (value as Record<string, unknown>)[key];

      return `${JSON.stringify(key)}:${stableJSONStringify(entry)}`;
    });

  return `{${entries.join(",")}}`;
};

type SearchPayload = Parameters<SearchService["search"]>[0];
type SearchResult = Awaited<ReturnType<SearchService["search"]>>;
type FacetsPayload = Parameters<SearchService["getFacets"]>[0];
type FacetsResult = Awaited<ReturnType<SearchService["getFacets"]>>;

type SearchViewModel = {
  categoryLabels: (string | null)[];
  fallbackCategoryLabel: string | null;
  pageInfo: PageInfo | null;
  products: SearchProduct[];
  sortOptions: SortByOption[];
};

const loadSearchResults = unstable_cache(
  async (serializedArgs: string): Promise<SearchResult> => {
    const { payload, context } = JSON.parse(serializedArgs) as {
      context: SearchContext;
      payload: SearchPayload;
    };

    const searchService = await getSearchService();

    return searchService.search(payload, context);
  },
  [CACHE_TAGS.results],
  {
    revalidate: CACHE_TTL.search,
    tags: [CACHE_TAGS.results],
  },
);

const loadFacets = unstable_cache(
  async (serializedArgs: string): Promise<FacetsResult> => {
    const { payload, context } = JSON.parse(serializedArgs) as {
      context: SearchContext;
      payload: FacetsPayload;
    };

    const searchService = await getSearchService();

    return searchService.getFacets(payload, context);
  },
  [CACHE_TAGS.facets],
  {
    revalidate: CACHE_TTL.search,
    tags: [CACHE_TAGS.facets],
  },
);

const loadCategoryLabels = unstable_cache(
  async (serializedArgs: string): Promise<(string | null)[]> => {
    const { slugs, languageCode } = JSON.parse(serializedArgs) as {
      languageCode: string;
      slugs: string[];
    };

    return fetchCategoryLabelsInternal(slugs, languageCode);
  },
  [CACHE_TAGS.categoryLabels],
  {
    revalidate: CACHE_TTL.search,
    tags: [CACHE_TAGS.categoryLabels],
  },
);

const loadCategoryProducts = unstable_cache(
  async (serializedArgs: string) => {
    const args = JSON.parse(serializedArgs) as {
      after?: string | null;
      before?: string | null;
      channel: string;
      languageCode: string;
      limit: number;
      slug: string;
    };

    return fetchCategoryProductsInternal(args);
  },
  [CACHE_TAGS.categoryProducts],
  {
    revalidate: CACHE_TTL.search,
    tags: [CACHE_TAGS.categoryProducts],
  },
);

const buildSearchViewModel = async ({
  categoryLabelsPromise,
  fallbackPromise,
  searchContext,
  searchResultPromise,
}: {
  categoryLabelsPromise: Promise<(string | null)[]>;
  fallbackPromise: Promise<
    | {
        categoryLabel: string | null;
        pageInfo: Extract<PageInfo, { type: "cursor" }>;
        products: SearchProduct[];
      }
    | null
  > | null;
  searchContext: SearchContext;
  searchResultPromise: Promise<SearchResult>;
}): Promise<SearchViewModel> => {
  const [categoryLabels, searchResult, searchService] = await Promise.all([
    categoryLabelsPromise,
    searchResultPromise,
    getSearchService(),
  ]);

  const sortOptionsResult = searchService.getSortByOptions(searchContext);
  const sortOptions = sortOptionsResult.ok ? sortOptionsResult.data : [];

  let products = searchResult.ok ? searchResult.data.results : [];
  let pageInfo = searchResult.ok ? searchResult.data.pageInfo : null;
  let fallbackCategoryLabel: string | null = null;

  if (!products.length && fallbackPromise) {
    const fallbackResult = await fallbackPromise;

    if (fallbackResult) {
      products = fallbackResult.products;
      pageInfo = fallbackResult.pageInfo;
      fallbackCategoryLabel = fallbackResult.categoryLabel ?? null;
    }
  }

  return {
    categoryLabels,
    fallbackCategoryLabel,
    pageInfo,
    products,
    sortOptions,
  };
};

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

  const region = await getCurrentRegion();

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
  const parsedLimit = limit ? Number.parseInt(limit) : DEFAULT_RESULTS_PER_PAGE;
  const categorySlugs = rest.category
    ? rest.category
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean)
    : [];
  const searchPayload: SearchPayload = {
    query,
    limit: parsedLimit,
    page,
    after,
    before,
    sortBy,
    filters: rest,
  };
  const facetsPayload: FacetsPayload = {
    query,
    filters: rest,
  };

  const fallbackPromise = rest.category
    ? fetchCategoryProducts({
        slug: categorySlugs[0] ?? rest.category,
        channel: searchContext.channel,
        languageCode: searchContext.languageCode ?? region.language.code,
        after,
        before,
        limit: parsedLimit,
      })
    : null;

  const serializedSearchArgs = stableJSONStringify({
    context: searchContext,
    payload: searchPayload,
  });
  const serializedFacetsArgs = stableJSONStringify({
    context: searchContext,
    payload: facetsPayload,
  });

  const categoryLabelsPromise = fetchCategoryLabels(
    categorySlugs,
    searchContext.languageCode ?? region.language.code,
  );
  const searchResultPromise = loadSearchResults(serializedSearchArgs);
  const viewModelPromise = buildSearchViewModel({
    categoryLabelsPromise,
    fallbackPromise,
    searchContext,
    searchResultPromise,
  });

  return (
    <Suspense fallback={<SearchPageSkeleton query={query} />}>
      <SearchContent
        categorySlugs={categorySlugs}
        collectionParam={searchParams.collection ?? ""}
        query={query}
        searchParams={searchParams}
        serializedFacetsArgs={serializedFacetsArgs}
        viewModelPromise={viewModelPromise}
      />
    </Suspense>
  );
}

async function SearchFilters({
  serializedArgs,
  searchParams,
  sortByOptions,
}: {
  serializedArgs: string;
  searchParams: Record<string, string>;
  sortByOptions: SortByOption[];
}) {
  const facetsResult = await loadFacets(serializedArgs);

  return (
    <FiltersContainer
      facets={facetsResult.ok ? facetsResult.data : []}
      searchParams={searchParams}
      sortByOptions={sortByOptions}
    />
  );
}

function FiltersSkeleton() {
  return (
    <div className="h-10 w-10 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 sm:w-28 dark:border-white/15 dark:bg-white/10" />
  );
}

async function SearchContent({
  categorySlugs,
  collectionParam,
  query,
  searchParams,
  serializedFacetsArgs,
  viewModelPromise,
}: {
  categorySlugs: string[];
  collectionParam: string;
  query: string;
  searchParams: Record<string, string>;
  serializedFacetsArgs: string;
  viewModelPromise: Promise<SearchViewModel>;
}) {
  const [t, viewModel] = await Promise.all([
    getTranslations(),
    viewModelPromise,
  ]);

  const normalizedSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );

  const categoryLabels = viewModel.categoryLabels.map((label, index) => {
    if (label?.trim()) {
      return label;
    }

    const slug = categorySlugs[index] ?? "";

    return formatSlugForHeader(slug);
  });

  if (
    !categoryLabels.length &&
    viewModel.fallbackCategoryLabel &&
    viewModel.fallbackCategoryLabel.trim()
  ) {
    categoryLabels.push(viewModel.fallbackCategoryLabel);
  }

  const collectionLabels = (collectionParam || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => formatSlugForHeader(value));

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

  const header = (() => {
    if (query) {
      return t("search.results-for", { query });
    }

    const categoryHeader = formatList(categoryLabels);
    const collectionHeader = formatList(collectionLabels);

    if (!categoryHeader && !collectionHeader) {
      return t("search.all-products");
    }

    if (categoryHeader) {
      return categoryHeader;
    }

    if (collectionHeader) {
      return collectionHeader;
    }

    return t("search.all-products");
  })();

  return (
    <div className="w-full">
      <Breadcrumbs pageName={header} />
      <section className="mx-auto my-8 grid gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-slate-700 dark:text-primary text-2xl">
            {header}
          </h2>
          <div className="flex gap-4">
            <div className="hidden md:block">
              <SearchSortBy options={viewModel.sortOptions} searchParams={searchParams} />
            </div>
            <Suspense fallback={<FiltersSkeleton />}>
              <SearchFilters
                serializedArgs={serializedFacetsArgs}
                searchParams={normalizedSearchParams}
                sortByOptions={viewModel.sortOptions}
              />
            </Suspense>
          </div>
        </div>

        {viewModel.products.length ? (
          <ProductsList products={viewModel.products} />
        ) : (
          <NoResults />
        )}

        {viewModel.pageInfo && (
          <SearchPagination
            pageInfo={viewModel.pageInfo}
            searchParams={searchParams}
            baseUrl={paths.search.asPath()}
          />
        )}
      </section>

      <JsonLd jsonLd={mappedSearchProductsToJsonLd(viewModel.products)} />
    </div>
  );
}

function SearchPageSkeleton({
  query,
}: {
  query: string;
}) {
  const placeholderTitle = query
    ? `Поиск: ${query}`
    : "Загрузка товаров...";

  return (
    <div className="w-full">
      <div className="mb-6 h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-white/10" />
      <section className="mx-auto my-8 grid gap-8">
        <div className="flex items-center justify-between">
          <h2 className="h-8 w-64 animate-pulse rounded bg-neutral-200 dark:bg-white/10">
            <span className="sr-only">{placeholderTitle}</span>
          </h2>
          <div className="flex gap-4">
            <div className="hidden h-10 w-32 animate-pulse rounded-lg bg-neutral-200 md:block dark:bg-white/10" />
            <FiltersSkeleton />
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-white/10"
            >
              <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-neutral-200 dark:bg-white/10" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-white/10" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      </section>
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

  return loadCategoryLabels(
    stableJSONStringify({
      languageCode,
      slugs,
    }),
  );
}

async function fetchCategoryLabelsInternal(
  slugs: string[],
  languageCode: string,
): Promise<(string | null)[]> {
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

const fetchCategoryProducts = async (params: {
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
  return loadCategoryProducts(
    stableJSONStringify({
      ...params,
      after: params.after ?? null,
      before: params.before ?? null,
    }),
  );
};

async function fetchCategoryProductsInternal({
  after,
  before,
  channel,
  languageCode,
  limit,
  slug,
}: {
  after?: string | null;
  before?: string | null;
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
> {
  const result = await saleorClient().execute(
    CATEGORY_PRODUCTS_FALLBACK_QUERY,
    {
      variables: {
        after: after ?? undefined,
        before: before ?? undefined,
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
}
