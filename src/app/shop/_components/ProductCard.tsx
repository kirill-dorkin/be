"use client";

import { MouseEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useCart } from "@/providers/CartProvider";
import { useFavorites } from "@/providers/FavoritesProvider";
import type { ProductTag } from "@/shared/types";

import { ProductImage } from "./ProductImage";
import type { CatalogView, SerializableProduct } from "./types";

const formatterCache = new Map<string, Intl.NumberFormat>();

function formatCurrency(amount: number, currency: string = "RUB") {
  const key = `${currency}:ru-RU`;
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      })
    );
  }
  return formatterCache.get(key)!.format(amount);
}

interface ProductCardProps {
  product: SerializableProduct;
  categoryName?: string;
  tags?: ProductTag[];
  view?: CatalogView;
}

export function ProductCard({ product, categoryName, tags = [], view = "grid" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [addedRecently, setAddedRecently] = useState(false);

  const productId = product._id ?? product.slug;
  const stock = typeof product.stock === "number" ? product.stock : 0;
  const isOutOfStock = stock <= 0;
  const formattedPrice = useMemo(() => formatCurrency(product.price, product.currency || "RUB"), [product.price, product.currency]);
  const favorite = isFavorite(productId);

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart({
      _id: product._id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      currency: product.currency,
      images: product.images,
    });
    setAddedRecently(true);
    window.setTimeout(() => setAddedRecently(false), 2200);
  };

  const handleToggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite({
      _id: product._id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      currency: product.currency,
      images: product.images,
    });
  };

  const rootClass = cn(
    "group relative flex flex-col gap-8 rounded-[28px] border border-neutral-200/70 bg-white p-8 shadow-[0_45px_120px_-100px_rgba(15,15,15,0.35)] transition-transform duration-500 hover:-translate-y-2",
    view === "list" && "md:flex-row md:items-stretch md:gap-10"
  );

  const imageWrapperClass = cn(
    "relative overflow-hidden rounded-[20px] bg-neutral-100",
    view === "list" ? "md:w-72 md:flex-shrink-0 aspect-[4/5]" : "aspect-[4/5]"
  );

  return (
    <article className={rootClass}>
      <div className={imageWrapperClass}>
        <Link
          href={`/shop/${product.slug}`}
          className="absolute inset-0 z-[1] block"
          aria-label={`Перейти к ${product.title}`}
        />
        <ProductImage
          src={product.images?.[0]}
          alt={product.title}
          sizes={view === "list" ? "(min-width: 1024px) 320px, 100vw" : "(min-width: 1280px) 280px, (min-width: 768px) 45vw, 100vw"}
          priority={false}
        />
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-pressed={favorite}
          aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}
          className={cn(
            "absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/90 text-neutral-500 transition hover:text-neutral-900",
            favorite && "border-primary/60 text-primary"
          )}
        >
          <Heart className={cn("h-5 w-5 transition", favorite && "fill-current")} />
        </button>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/70 opacity-0 transition duration-500 group-hover:opacity-100" />
      </div>

      <div className={cn("flex flex-1 flex-col gap-6", view === "list" && "md:py-4")}
      >
        <div className="flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-neutral-400">
          {categoryName && <span>{categoryName}</span>}
          {tags.slice(0, 2).map((tag) => (
            <span key={tag._id} className="text-neutral-400">#{tag.name}</span>
          ))}
        </div>
        <div className="space-y-2">
          <Link href={`/shop/${product.slug}`} className="text-lg font-semibold leading-tight text-neutral-900 transition hover:text-neutral-600">
            {product.title}
          </Link>
          {product.description && (
            <p className={cn("text-sm text-neutral-500", view === "grid" ? "line-clamp-2" : "line-clamp-3")}>{product.description}</p>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <div className="space-y-1">
            <div className="text-2xl font-semibold text-neutral-900">{formattedPrice}</div>
            <div className="text-xs uppercase tracking-[0.35em] text-neutral-400">
              {isOutOfStock ? "Нет в наличии" : `В наличии: ${stock}`}
            </div>
          </div>
          <Button
            className="h-12 w-full rounded-[999px] border border-neutral-300/80 bg-white px-6 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-all duration-500 hover:-translate-y-0.5 hover:text-neutral-900"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            {addedRecently ? (
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4" />
                Добавлено
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Добавить
              </span>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
