import ClientHeader from "@/widgets/header/ClientHeader";
import { Section } from "@/shared/ui/launchui";
import { shopStore } from "@/shared/lib/shopStore";
import BaseContainer from "@/shared/ui/BaseContainer";
import type { Product, ProductCategory, ProductTag } from "@/shared/types";
import { ShopHero } from "./_components/ShopHero";
import { ShopPageClient } from "./_components/ShopPageClient";
import type { CatalogSort, CatalogState, CatalogView, SerializableProduct } from "./_components/types";

const DEFAULT_STATE: CatalogState = {
  search: "",
  category: "all",
  sort: "newest",
  tags: [],
  onlyInStock: false,
  view: "grid",
  page: 1,
};

type ShopSearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  tags?: string | string[];
  stock?: string;
  view?: string;
  page?: string;
};

const SORT_OPTIONS: CatalogSort[] = ["newest", "oldest", "name_asc", "name_desc", "price_asc", "price_desc"];
const VIEW_OPTIONS: CatalogView[] = ["grid", "list"];

function serializeProduct(product: Product): SerializableProduct {
  return {
    ...product,
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : null,
    updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : null,
  };
}

function normalizeTags(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function deriveInitialState(params: ShopSearchParams | undefined): CatalogState {
  if (!params) return { ...DEFAULT_STATE };
  const tags = normalizeTags(params.tags);
  const sort = SORT_OPTIONS.includes(params.sort as CatalogSort) ? (params.sort as CatalogSort) : DEFAULT_STATE.sort;
  const view = VIEW_OPTIONS.includes(params.view as CatalogView) ? (params.view as CatalogView) : DEFAULT_STATE.view;
  const page = Number.isFinite(Number(params.page)) && Number(params.page) > 0 ? Number(params.page) : DEFAULT_STATE.page;

  return {
    search: params.q?.toString() ?? DEFAULT_STATE.search,
    category: params.category?.toString() ?? DEFAULT_STATE.category,
    sort,
    tags,
    onlyInStock: params.stock === "in",
    view,
    page,
  };
}

function validateCategorySlug(category: string, categories: ProductCategory[]): string {
  if (!category || category === "all") return "all";
  return categories.some((item) => item.slug === category) ? category : "all";
}

function validateTags(tagSlugs: string[], tags: ProductTag[]): string[] {
  const allowed = new Set(tags.map((tag) => tag.slug));
  return tagSlugs.filter((slug) => allowed.has(slug));
}

type ShopPageProps = {
  searchParams?: ShopSearchParams | Promise<ShopSearchParams | undefined>;
};

async function resolveSearchParams(params: ShopPageProps["searchParams"]): Promise<ShopSearchParams | undefined> {
  if (!params) return undefined;
  if (typeof (params as Promise<unknown>)?.then === "function") {
    return (await params) ?? undefined;
  }
  return params as ShopSearchParams;
}

export default async function ShopPage(props: ShopPageProps) {
  const products = shopStore.listProducts();
  const categories = shopStore.listCategories();
  const allTags = shopStore.listTags();

  const serializableProducts = products.map(serializeProduct);

  const productCount = products.length;
  const categoryCount = categories.length;
  const tagCount = allTags.length;
  const inStockCount = products.reduce((acc, product) => acc + Math.max(product.stock ?? 0, 0), 0);

  const resolvedParams = await resolveSearchParams(props.searchParams);
  const rawInitialState = deriveInitialState(resolvedParams);
  const initialState: CatalogState = {
    ...rawInitialState,
    category: validateCategorySlug(rawInitialState.category, categories),
    tags: validateTags(rawInitialState.tags, allTags),
  };

  return (
    <>
      <ClientHeader />
      <main className="flex min-h-screen flex-col bg-white pt-[var(--header-height)]">
        <Section className="pb-0">
          <BaseContainer className="space-y-16">
            <ShopHero
              productCount={productCount}
              categoryCount={categoryCount}
              tagCount={tagCount}
              inStockCount={inStockCount}
            />
            <ShopPageClient
              products={serializableProducts}
              categories={categories}
              tags={allTags}
              initialState={initialState}
              defaultState={DEFAULT_STATE}
            />
          </BaseContainer>
        </Section>
      </main>
    </>
  );
}
