"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Heart, RefreshCcw, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/shared/lib/utils";
import type { ProductCategory, ProductTag } from "@/shared/types";
import { useCart } from "@/providers/CartProvider";
import { useFavorites } from "@/providers/FavoritesProvider";

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
  const { itemCount } = useCart();
  const { favoritesCount } = useFavorites();

  const tagById = useMemo(() => new Map(tags.map((tag) => [tag._id, tag])), [tags]);
  const tagBySlug = useMemo(() => new Map(tags.map((tag) => [tag.slug, tag])), [tags]);
  const categoryById = useMemo(() => new Map(categories.map((category) => [category._id, category])), [categories]);
  const categoryBySlug = useMemo(() => new Map(categories.map((category) => [category.slug, category])), [categories]);

  useEffect(() => {
    const resolved = resolveStateFromSearch(searchParams, defaultState);
    setState((prev) => {
      const changed = JSON.stringify(prev) !== JSON.stringify(resolved);
      return changed ? resolved : prev;
    });
    setSearchInput(resolved.search);
  }, [searchParams, defaultState]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setState((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 240);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

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
    if (state.page !== defaultState.page) params.set("page", state.page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [state, router, pathname, defaultState]);

  const filtered = useMemo(() => {
    const query = state.search.trim().toLowerCase();
    const categoryId = state.category !== "all" ? categoryBySlug.get(state.category)?._id : undefined;
    const tagIds = state.tags.map((slug) => tagBySlug.get(slug)?._id).filter(Boolean);
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
    <div className="space-y-16">
      <section className="animate-fade-up delay-2 rounded-[48px] border border-neutral-200/70 bg-white px-8 py-12 shadow-[0_55px_150px_-90px_rgba(15,15,15,0.4)]">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-neutral-200/60 bg-neutral-50/60 px-6 py-4">
          <div className="space-y-1">
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.45em] text-neutral-400">
              Личные подборки
            </span>
            <p className="text-sm text-neutral-500">
              Возвращайтесь к отобранным позициям и оформляйте заказ в удобное время.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 w-full rounded-full border border-neutral-300/80 bg-white px-6 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-colors hover:text-neutral-900 sm:w-auto"
            >
              <Link
                href="/shop/cart"
                className="inline-flex items-center gap-3"
              >
                <ShoppingCart className="h-4 w-4" />
                Корзина
                <span className="inline-flex min-w-[2.25rem] justify-center rounded-full bg-neutral-900 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white">
                  {itemCount}
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 w-full rounded-full border border-neutral-300/80 bg-white px-6 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-colors hover:text-neutral-900 sm:w-auto"
            >
              <Link
                href="/shop/favorites"
                className="inline-flex items-center gap-3"
              >
                <Heart className="h-4 w-4" />
                Избранное
                <span className="inline-flex min-w-[2.25rem] justify-center rounded-full bg-neutral-900 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white">
                  {favoritesCount}
                </span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))_minmax(0,1fr)]">
          <div className="relative">
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Поиск по каталогу"
              className="h-12 rounded-full border-neutral-200 bg-white px-6 text-sm font-medium"
            />
          </div>
          <Select
            value={state.category || "all"}
            onValueChange={(value) => setState((prev) => ({ ...prev, category: value === "all" ? "all" : value, page: 1 }))}
          >
            <SelectTrigger className="h-12 rounded-full border-neutral-200 bg-white px-6 text-sm font-medium text-neutral-600">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-neutral-200 bg-white shadow-xl">
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
            <SelectTrigger className="h-12 rounded-full border-neutral-200 bg-white px-6 text-sm font-medium text-neutral-600">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-neutral-200 bg-white shadow-xl">
              {(Object.keys(sortLabels) as CatalogSort[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {sortLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex h-12 items-center justify-between rounded-full border border-neutral-200 bg-white px-6 text-sm font-medium text-neutral-600">
            <span>Только в наличии</span>
            <Switch
              checked={state.onlyInStock}
              onCheckedChange={(checked) => setState((prev) => ({ ...prev, onlyInStock: checked, page: 1 }))}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {tags.length === 0 && (
            <span className="text-sm text-neutral-400">Теги появятся позже</span>
          )}
          {tags.map((tag) => {
            const active = state.tags.includes(tag.slug);
            return (
              <button
                key={tag._id}
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.35em] transition",
                  active
                    ? "border-neutral-900 bg-neutral-900 text-neutral-100 shadow"
                    : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-900/40 hover:text-neutral-900"
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

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-500">
          <span>Найдено позиций: {filtered.length.toLocaleString("ru-RU")}</span>
          <Button
            type="button"
            variant="ghost"
            className="rounded-full border border-neutral-300/80 bg-white px-6 text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500 transition-colors hover:text-neutral-900"
            onClick={() => {
              setSearchInput(defaultState.search);
              setState({ ...defaultState });
            }}
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Сбросить
          </Button>
        </div>
      </section>

      <section id="catalog-section" className="space-y-8">
        {paginated.length === 0 ? (
          <div className="animate-fade-up rounded-[40px] border border-dashed border-neutral-300/70 bg-white px-10 py-16 text-center text-neutral-500">
            <p className="text-lg font-medium">Товары не найдены</p>
            <p className="mt-2 text-sm">Измените фильтры или сбросьте их.</p>
          </div>
        ) : (
          <div
            className={cn(
              "animate-fade-up delay-2 grid gap-8",
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
          <div className="animate-fade-up delay-4 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full border border-neutral-300/80 px-6 text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500 transition-colors hover:text-neutral-900"
              disabled={state.page === 1}
              onClick={() => setState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            >
              Назад
            </Button>
            {Array.from({ length: totalPages }).slice(0, 7).map((_, index) => {
              const page = index + 1;
              const active = page === state.page;
              return (
                <Button
                  key={page}
                  type="button"
                  variant={active ? "default" : "ghost"}
                  className="rounded-full px-5 text-xs font-semibold uppercase tracking-[0.35em]"
                  onClick={() => setState((prev) => ({ ...prev, page }))}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              type="button"
              variant="ghost"
              className="rounded-full border border-neutral-300/80 px-6 text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500 transition-colors hover:text-neutral-900"
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
