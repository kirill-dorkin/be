"use client";

import { useMemo, useState, MouseEvent } from "react";
import Link from "next/link";
import { Heart, Eye, ShoppingCart, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useCart } from "@/providers/CartProvider";
import { useFavorites } from "@/providers/FavoritesProvider";
import { ProductTag } from "@/shared/types";
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
        maximumFractionDigits: 2,
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
  const [isPreviewing, setIsPreviewing] = useState(false);

  const productId = product._id ?? product.slug;
  const stock = typeof product.stock === "number" ? product.stock : 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

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
    window.setTimeout(() => setAddedRecently(false), 2600);
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

  const contentWrapperClass = cn(
    "group relative overflow-hidden rounded-3xl border border-border/70 bg-white shadow-sm transition hover:-translate-y-1 hover:border-border focus-within:border-primary",
    view === "list" && "md:flex md:items-stretch"
  );

  const imageWrapperClass = cn(
    "relative w-full overflow-hidden bg-slate-100",
    view === "list" ? "md:w-72 md:min-w-[18rem] aspect-[4/3]" : "aspect-square"
  );

  const actionButtonClass = cn(
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/80 text-foreground shadow-sm backdrop-blur transition hover:border-primary hover:text-primary",
    favorite && "border-primary/60 bg-primary/10 text-primary"
  );

  return (
    <Card className={contentWrapperClass}>
      <Link href={`/shop/${product.slug}`} className={imageWrapperClass} aria-label={`Перейти к товару ${product.title}`}>
        <ProductImage
          src={product.images?.[0]}
          alt={product.title}
          sizes={view === "list" ? "(min-width: 1024px) 320px, 100vw" : "(min-width: 1280px) 280px, (min-width: 768px) 45vw, 100vw"}
          priority={false}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/70 opacity-0 transition duration-300 group-hover:opacity-100" />
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button type="button" className={actionButtonClass} onClick={handleToggleFavorite} aria-pressed={favorite} aria-label={favorite ? "Убрать из избранного" : "Добавить в избранное"}>
            <Heart className={cn("h-4 w-4 transition", favorite && "fill-current")} />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/80 text-foreground shadow-sm backdrop-blur transition hover:border-primary hover:text-primary"
            aria-label="Быстрый просмотр"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsPreviewing(true);
              window.setTimeout(() => setIsPreviewing(false), 1200);
            }}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
        {isLowStock && !isOutOfStock && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900 shadow">
            Мало товара
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow">
            Нет в наличии
          </span>
        )}
      </Link>

      <CardContent className={cn("flex flex-1 flex-col gap-4 p-6", view === "list" && "md:p-8")}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {categoryName && (
              <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                {categoryName}
              </span>
            )}
            {tags.slice(0, 2).map((tag) => (
              <span key={tag._id} className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500">
                #{tag.name}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            <Link href={`/shop/${product.slug}`} className="text-lg font-semibold leading-tight text-foreground transition hover:text-primary">
              {product.title}
            </Link>
            {product.description && (
              <p className={cn("text-sm text-muted-foreground", view === "grid" ? "line-clamp-2" : "line-clamp-3")}>{product.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-semibold text-foreground md:text-3xl">{formattedPrice}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {isOutOfStock ? "Нет в наличии" : `В наличии: ${stock} шт.`}
            </div>
          </div>
          <Button
            className={cn(
              "h-12 min-w-[12rem] rounded-2xl px-6 text-base font-semibold shadow-md transition hover:shadow-lg",
              addedRecently && "bg-emerald-600 hover:bg-emerald-500"
            )}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            {addedRecently ? (
              <>
                <ShoppingBag className="h-4 w-4" />
                В корзине
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                В корзину
              </>
            )}
          </Button>
        </div>

        {isPreviewing && (
          <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-xs text-muted-foreground">
            Быстрый просмотр находится в разработке
          </div>
        )}
      </CardContent>
    </Card>
  );
}
