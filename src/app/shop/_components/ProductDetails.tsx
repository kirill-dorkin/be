"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, ArrowLeft, ShoppingCart, Heart, Package, ShieldCheck } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useFavorites } from "@/providers/FavoritesProvider";
import { ProductTag } from "@/shared/types";
import { cn } from "@/shared/lib/utils";
import { ProductImage } from "./ProductImage";
import type { SerializableProduct } from "./types";

const formatterCache = new Map<string, Intl.NumberFormat>();

function formatCurrency(value: number, currency: string = "RUB") {
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
  return formatterCache.get(key)!.format(value);
}

interface ProductDetailsProps {
  product: SerializableProduct;
  categoryName?: string;
  tags?: ProductTag[];
}

export function ProductDetails({ product, categoryName, tags = [] }: ProductDetailsProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const stock = typeof product.stock === "number" ? product.stock : 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const favorite = isFavorite(product._id ?? product.slug);

  const price = useMemo(() => formatCurrency(product.price, product.currency), [product.price, product.currency]);

  const images = product.images && product.images.length > 0 ? product.images : [undefined];

  return (
    <div className="space-y-8">
      <Button variant="outline" className="inline-flex items-center gap-2 rounded-2xl" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Назад к каталогу
      </Button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/70 bg-slate-100">
            <ProductImage
              src={images[selectedImage]}
              alt={product.title}
              sizes="(min-width: 1024px) 540px, 100vw"
              priority
            />
            {isOutOfStock && (
              <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Нет в наличии
              </span>
            )}
            {isLowStock && !isOutOfStock && (
              <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900">
                Мало товара
              </span>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
              {product.images.map((image, index) => (
                <button
                  key={image ?? index}
                  type="button"
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-2xl border border-border bg-slate-100 transition",
                    index === selectedImage ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/60"
                  )}
                  onClick={() => setSelectedImage(index)}
                >
                  <ProductImage src={image} alt={`${product.title} ${index + 1}`} sizes="120px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <Card className="border border-border/70 bg-white/95 shadow-lg shadow-slate-900/5">
          <CardContent className="space-y-6 p-6 md:p-8">
            <div className="space-y-3">
              {categoryName && (
                <span className="inline-flex items-center rounded-full border border-border/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {categoryName}
                </span>
              )}
              <h1 className="text-3xl font-semibold leading-tight md:text-4xl">{product.title}</h1>
              {product.description && (
                <p className="text-base text-muted-foreground">{product.description}</p>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {tags.map((tag) => (
                    <span key={tag._id} className="inline-flex items-center rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Стоимость</div>
                  <div className="text-3xl font-semibold text-foreground md:text-[32px]">{price}</div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Гарантия 12 месяцев
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-border/70 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground">
                  В наличии: {Math.max(stock, 0)} шт.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-foreground transition hover:border-primary"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[3rem] text-center text-lg font-semibold">{quantity}</span>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-foreground transition hover:border-primary"
                    onClick={() => setQuantity((prev) => Math.min(prev + 1, Math.max(stock, 1)))}
                    disabled={quantity >= Math.max(stock, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 rounded-2xl px-6 text-base font-semibold shadow-md hover:shadow-lg"
                  disabled={isOutOfStock}
                  onClick={() => {
                    addToCart({
                      _id: product._id,
                      slug: product.slug,
                      title: product.title,
                      price: product.price,
                      currency: product.currency,
                      images: product.images,
                    }, quantity);
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Добавить в корзину
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("h-12 w-12 rounded-2xl", favorite && "border-primary text-primary")}
                  onClick={() =>
                    toggleFavorite({
                      _id: product._id,
                      slug: product.slug,
                      title: product.title,
                      price: product.price,
                      currency: product.currency,
                      images: product.images,
                    })
                  }
                  aria-pressed={favorite}
                >
                  <Heart className={cn("h-5 w-5", favorite && "fill-current")}
                  />
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border/70 bg-slate-50 p-4 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-primary" />
                  Бесплатная доставка по Бишкеку при заказе от 20 000 ₽
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Возможность расширенной гарантии по запросу
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
