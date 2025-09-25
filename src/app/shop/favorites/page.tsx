"use client";

import Link from "next/link";
import BaseContainer from "@/shared/ui/BaseContainer";
import { useFavorites } from "@/providers/FavoritesProvider";
import { useCart } from "@/providers/CartProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, HeartOff, ShoppingCart } from "lucide-react";
import ClientHeader from "@/widgets/header/ClientHeader";
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
    <>
      <ClientHeader />
      <main className="flex min-h-screen flex-col bg-white pt-[var(--header-height)]">
        <BaseContainer className="space-y-12 py-16">
        <section className="rounded-[48px] border border-neutral-200/70 bg-white px-10 py-12 shadow-[0_60px_180px_-120px_rgba(15,15,15,0.5)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-4">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-neutral-400">Личный список</span>
              <div className="space-y-3">
                <h1 className="text-[clamp(2.4rem,5vw,3.6rem)] font-light tracking-tight text-neutral-900">Избранное</h1>
                <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">
                  Сохраняйте технику для сравнения и быстрых заказов. Мы сообщим, если позиция появится в наличии или получит специальную цену.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 text-right">
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">Выбрано</span>
              <span className="text-4xl font-light tracking-tight text-neutral-900">{favoritesCount.toLocaleString("ru-RU")}</span>
              {favoritesCount > 0 && (
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full border border-neutral-300/80 bg-white px-6 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-colors hover:text-neutral-900"
                  onClick={clearFavorites}
                >
                  Очистить список
                </Button>
              )}
            </div>
          </div>
        </section>

        {favoritesCount === 0 ? (
          <Card className="mx-auto max-w-3xl rounded-[40px] border border-dashed border-neutral-200/70 bg-white/95 text-center shadow-none">
            <CardContent className="space-y-7 px-10 py-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-neutral-200/70 bg-neutral-50">
                <HeartOff className="h-8 w-8 text-neutral-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-neutral-900">Список пуст</h2>
                <p className="text-sm text-neutral-500">Добавляйте товары из каталога, чтобы следить за доступностью и делиться подборками с командой.</p>
              </div>
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-6 text-xs font-semibold uppercase tracking-[0.45em]"
              >
                <Link href="/shop">Перейти в каталог</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((item) => (
              <Card key={item.productId} className="flex h-full flex-col overflow-hidden rounded-[32px] border border-neutral-200/70 bg-white/95 shadow-[0_45px_140px_-110px_rgba(15,15,15,0.45)]">
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  <ProductImage src={item.image} alt={item.title} />
                  <button
                    type="button"
                    aria-label="Убрать из избранного"
                    className="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/90 text-neutral-500 transition hover:text-neutral-900"
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
                    <Heart className="h-5 w-5 fill-current text-primary" />
                  </button>
                </div>
                <CardContent className="flex flex-1 flex-col gap-6 p-6">
                  <div className="space-y-2">
                    <Link href={`/shop/${item.slug}`} className="text-lg font-semibold leading-tight text-neutral-900 transition hover:text-neutral-600">
                      {item.title}
                    </Link>
                    <div className="text-sm text-neutral-500">{formatCurrency(item.price, item.currency)}</div>
                  </div>
                  <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                    <Button
                      className="flex-1 rounded-full text-xs font-semibold uppercase tracking-[0.45em]"
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
                      variant="ghost"
                      className="rounded-full border border-neutral-300/80 bg-white text-xs font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-colors hover:text-neutral-900"
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
    </>
  );
}
