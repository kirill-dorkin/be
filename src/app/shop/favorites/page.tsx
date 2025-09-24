"use client";

import Link from "next/link";
import BaseContainer from "@/shared/ui/BaseContainer";
import { useFavorites } from "@/providers/FavoritesProvider";
import { useCart } from "@/providers/CartProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeartOff, ShoppingCart } from "lucide-react";
import { ProductImage } from "../_components/ProductImage";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function FavoritesPage() {
  const { favorites, favoritesCount, toggleFavorite, clearFavorites } = useFavorites();
  const { addToCart } = useCart();

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <BaseContainer className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Избранное</h1>
            <p className="text-sm text-muted-foreground">Сохранённые позиции для быстрого доступа и сравнения</p>
          </div>
          {favoritesCount > 0 && (
            <Button variant="outline" className="rounded-2xl" onClick={clearFavorites}>
              Очистить список
            </Button>
          )}
        </div>

        {favoritesCount === 0 ? (
          <Card className="mx-auto w-full max-w-lg border border-dashed border-border/70 bg-white/95 text-center">
            <CardContent className="space-y-6 py-12">
              <HeartOff className="mx-auto h-16 w-16 text-muted-foreground" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Список пуст</h2>
                <p className="text-sm text-muted-foreground">Добавляйте товары из каталога, чтобы следить за скидками и доступностью.</p>
              </div>
              <Button asChild className="rounded-2xl px-6">
                <Link href="/shop">Перейти в каталог</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((item) => (
              <Card key={item.productId} className="flex h-full flex-col overflow-hidden border border-border/70 bg-white/95 shadow-sm">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <ProductImage src={item.image} alt={item.title} />
                </div>
                <CardContent className="flex flex-1 flex-col gap-4 p-5">
                  <div className="space-y-2">
                    <Link href={`/shop/${item.slug}`} className="text-lg font-semibold leading-tight text-foreground transition hover:text-primary">
                      {item.title}
                    </Link>
                    <div className="text-sm text-muted-foreground">{formatCurrency(item.price, item.currency)}</div>
                  </div>
                  <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                    <Button
                      className="flex-1 rounded-2xl"
                      onClick={() =>
                        addToCart({
                          _id: item.productId,
                          slug: item.slug,
                          title: item.title,
                          price: item.price,
                          currency: item.currency,
                          images: item.image ? [item.image] : undefined,
                        })
                      }
                    >
                      <ShoppingCart className="h-4 w-4" />
                      В корзину
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() =>
                        toggleFavorite({
                          _id: item.productId,
                          slug: item.slug,
                          title: item.title,
                          price: item.price,
                          currency: item.currency,
                          images: item.image ? [item.image] : undefined,
                        })
                      }
                    >
                      <HeartOff className="h-4 w-4" />
                      Удалить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </BaseContainer>
    </main>
  );
}
