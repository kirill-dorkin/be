"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Grid, List, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { ProductCategory, ProductTag } from "@/shared/types";
import { cn } from "@/shared/lib/utils";
import { ProductCard } from "./ProductCard";
import type { CatalogSort, CatalogState, CatalogView, SerializableProduct } from "./types";

const PAGE_SIZE = 12;

interface ShopPageClientProps {
  products: SerializableProduct[];
  categories: ProductCategory[];
  tags: ProductTag[];
  initialState: CatalogState;
  defaultState: CatalogState;
}

const sortLabels: Record<CatalogSort, string> = {
  newest: "Новые первыми",
  oldest: "Сначала старые",
  name_asc: "По названию (А–Я)",
  name_desc: "По названию (Я–А)",
  price_asc: "Сначала дешевле",
  price_desc: "Сначала дороже",
};

function resolveStateFromSearch(searchParams: URLSearchParams, defaultState: CatalogState): CatalogState {
  const search = searchParams.get("q") ?? defaultState.search;
  const category = searchParams.get("category") ?? defaultState.category;
  const sort = (searchParams.get("sort") as CatalogSort | null) ?? defaultState.sort;
  const tags = searchParams.getAll("tags");
  const stock = searchParams.get("stock") === "in";
  const view = (searchParams.get("view") as CatalogView | null) ?? defaultState.view;
  const pageParam = Number(searchParams.get("page") ?? defaultState.page);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : defaultState.page;
  return { search, category, sort, tags, onlyInStock: stock, view, page };
}

function getSortComparator(sort: CatalogSort) {
  switch (sort) {
    case "price_asc":
      return (a: SerializableProduct, b: SerializableProduct) => a.price - b.price;
    case "price_desc":
      return (a: SerializableProduct, b: SerializableProduct) => b.price - a.price;
    case "name_asc":
      return (a: SerializableProduct, b: SerializableProduct) => a.title.localeCompare(b.title, "ru");
    case "name_desc":
      return (a: SerializableProduct, b: SerializableProduct) => b.title.localeCompare(a.title, "ru");
    case "oldest":
      return (a: SerializableProduct, b: SerializableProduct) => {
        const dateA = a.createdAt ? Date.parse(a.createdAt) : 0;
        const dateB = b.createdAt ? Date.parse(b.createdAt) : 0;
        return dateA - dateB;
      };
    case "newest":
    default:
      return (a: SerializableProduct, b: SerializableProduct) => {
        const dateA = a.createdAt ? Date.parse(a.createdAt) : 0;
        const dateB = b.createdAt ? Date.parse(b.createdAt) : 0;
        return dateB - dateA;
      };
  }
}

export function ShopPageClient({ products, categories, tags, initialState, defaultState }: ShopPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<CatalogState>(initialState);
  const [searchInput, setSearchInput] = useState(initialState.search);
  const initialSync = useRef(true);

  const tagById = useMemo(() => new Map(tags.map((tag) => [tag._id, tag])), [tags]);
  const tagBySlug = useMemo(() => new Map(tags.map((tag) => [tag.slug, tag])), [tags]);
  const categoryById = useMemo(() => new Map(categories.map((category) => [category._id, category])), [categories]);
  const categoryBySlug = useMemo(() => new Map(categories.map((category) => [category.slug, category])), [categories]);

  // Sync state with URL changes (back/forward)
  useEffect(() => {
    const resolved = resolveStateFromSearch(searchParams, defaultState);
    setState((prev) => {
      const changed = JSON.stringify(prev) !== JSON.stringify(resolved);
      return changed ? resolved : prev;
    });
    setSearchInput(resolved.search);
  }, [searchParams, defaultState]);

  // Debounced search update
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setState((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 280);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  // Push state to URL (skip first render)
  useEffect(() => {
    if (initialSync.current) {
      initialSync.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (state.search.trim().length > 0) params.set("q", state.search.trim());
    if (state.category && state.category !== "all") params.set("category", state.category);
    if (state.sort !== defaultState.sort) params.set("sort", state.sort);
    if (state.tags.length > 0) state.tags.forEach((tag) => params.append("tags", tag));
    if (state.onlyInStock) params.set("stock", "in");
    if (state.view !== defaultState.view) params.set("view", state.view);
    if (state.page > 1) params.set("page", state.page.toString());

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [state, router, pathname, defaultState.sort, defaultState.view]);

  const filtered = useMemo(() => {
    const categoryId = state.category && state.category !== "all" ? categoryBySlug.get(state.category)?._id : undefined;
    const tagIds = state.tags.map((slug) => tagBySlug.get(slug)?._id).filter(Boolean) as string[];
    const query = state.search.trim().toLowerCase();
    const sortComparator = getSortComparator(state.sort);

    return [...products]
      .filter((product) => {
        const matchesCategory = categoryId ? product.categoryId === categoryId : true;
        const matchesTags = tagIds.length > 0 ? (product.tags || []).some((tagId) => tagIds.includes(tagId)) : true;
        const matchesStock = state.onlyInStock ? (product.stock ?? 0) > 0 : true;
        const matchesQuery = query.length
          ? product.title.toLowerCase().includes(query) || (product.description ?? "").toLowerCase().includes(query)
          : true;
        return matchesCategory && matchesTags && matchesStock && matchesQuery && (product.isActive ?? true);
      })
      .sort(sortComparator);
  }, [products, state, categoryBySlug, tagBySlug]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (state.page > totalPages) {
      setState((prev) => ({ ...prev, page: totalPages }));
    }
  }, [totalPages, state.page]);

  const start = (state.page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <Card className="border border-border/70 bg-card/80 shadow-lg shadow-slate-900/5">
          <CardHeader className="flex flex-col gap-4 pb-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Filter className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-xl">Фильтры и поиск</CardTitle>
                <p className="text-sm text-muted-foreground">Настройте отображение каталога под ваши задачи</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn("h-11 w-11 rounded-2xl", state.view === "grid" && "border-primary text-primary")}
                onClick={() => setState((prev) => ({ ...prev, view: "grid" }))}
                aria-label="Показать сеткой"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn("h-11 w-11 rounded-2xl", state.view === "list" && "border-primary text-primary")}
                onClick={() => setState((prev) => ({ ...prev, view: "list" }))}
                aria-label="Показать списком"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))_minmax(0,1fr)]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Поиск по названию или описанию"
                  className="h-12 rounded-2xl border border-input/70 bg-background/80 pl-11 text-sm font-medium"
                />
              </div>
              <Select
                value={state.category || "all"}
                onValueChange={(value) => setState((prev) => ({ ...prev, category: value === "all" ? "all" : value, page: 1 }))}
              >
                <SelectTrigger className="h-12 rounded-2xl border border-input/70 bg-background/80 text-sm font-medium">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={state.sort}
                onValueChange={(value: CatalogSort) => setState((prev) => ({ ...prev, sort: value, page: 1 }))}
              >
                <SelectTrigger className="h-12 rounded-2xl border border-input/70 bg-background/80 text-sm font-medium">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(sortLabels) as CatalogSort[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {sortLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex h-12 items-center justify-between rounded-2xl border border-input/70 bg-background/80 px-4 text-sm font-medium">
                <span>Только в наличии</span>
                <Switch
                  checked={state.onlyInStock}
                  onCheckedChange={(checked) => setState((prev) => ({ ...prev, onlyInStock: checked, page: 1 }))}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.length === 0 && (
                <span className="text-sm text-muted-foreground">Теги появятся после настройки ассортимента</span>
              )}
              {tags.map((tag) => {
                const active = state.tags.includes(tag.slug);
                return (
                  <button
                    key={tag._id}
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow"
                        : "border-border/80 bg-background/80 text-muted-foreground hover:border-primary/60 hover:text-foreground"
                    )}
                    onClick={() =>
                      setState((prev) => {
                        const exists = prev.tags.includes(tag.slug);
                        const nextTags = exists ? prev.tags.filter((slug) => slug !== tag.slug) : [...prev.tags, tag.slug];
                        return { ...prev, tags: nextTags, page: 1 };
                      })
                    }
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>

            <Separator className="bg-border/60" />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Найдено товаров: {filtered.length.toLocaleString("ru-RU")}
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl border-dashed"
                onClick={() => {
                  setSearchInput(defaultState.search);
                  setState({ ...defaultState });
                }}
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Сбросить фильтры
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="catalog" className="space-y-6">
        {paginated.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/70 bg-white/90 p-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">Товары не найдены по заданным условиям</p>
            <p className="mt-2 text-sm">Попробуйте изменить фильтры или сбросьте их.</p>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-6",
              state.view === "grid"
                ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                : "grid-cols-1"
            )}
          >
            {paginated.map((product) => (
              <ProductCard
                key={product._id ?? product.slug}
                product={product}
                categoryName={product.categoryId ? categoryById.get(product.categoryId)?.name : undefined}
                tags={(product.tags || []).map((tagId) => tagById.get(tagId)).filter((tag): tag is ProductTag => Boolean(tag))}
                view={state.view}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              disabled={state.page === 1}
              onClick={() => setState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            >
              Назад
            </Button>
            {Array.from({ length: totalPages }).slice(0, 7).map((_, index) => {
              const page = index + 1;
              return (
                <Button
                  key={page}
                  type="button"
                  variant={page === state.page ? "default" : "outline"}
                  className="rounded-2xl px-4"
                  onClick={() => setState((prev) => ({ ...prev, page }))}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              disabled={state.page === totalPages}
              onClick={() => setState((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
            >
              Далее
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
