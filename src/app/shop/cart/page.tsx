"use client";

import Link from "next/link";
import { useMemo } from "react";
import BaseContainer from "@/shared/ui/BaseContainer";
import { useCart } from "@/providers/CartProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import ClientHeader from "@/widgets/header/ClientHeader";
import { ProductImage } from "../_components/ProductImage";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CartPage() {
  const { items, removeFromCart, clearCart, setQuantity } = useCart();
  const currency = items[0]?.currency ?? "RUB";
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const summary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = subtotal > 20000 ? 0 : subtotal > 0 ? 590 : 0;
    return { subtotal, delivery, total: subtotal + delivery };
  }, [items]);

  return (
    <>
      <ClientHeader />
      <main className="flex min-h-screen flex-col bg-white pt-[var(--header-height)]">
        <BaseContainer className="space-y-12 py-16">
        <section className="rounded-[48px] border border-neutral-200/70 bg-white px-10 py-12 shadow-[0_60px_180px_-120px_rgba(15,15,15,0.5)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-4">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-neutral-400">Сводка заказа</span>
              <div className="space-y-3">
                <h1 className="text-[clamp(2.4rem,5vw,3.6rem)] font-light tracking-tight text-neutral-900">Корзина</h1>
                <p className="max-w-2xl text-sm leading-relaxed text-neutral-500">
                  Проверьте выбранные позиции, скорректируйте количество и переходите к оформлению заказа. Менеджер свяжется, чтобы подтвердить детали доставки.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 text-right">
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">Позиции</span>
              <span className="text-4xl font-light tracking-tight text-neutral-900">{itemCount.toLocaleString("ru-RU")}</span>
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full border border-neutral-300/80 bg-white px-6 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-colors hover:text-neutral-900"
                  onClick={clearCart}
                >
                  Очистить корзину
                </Button>
              )}
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <Card className="mx-auto max-w-3xl rounded-[40px] border border-dashed border-neutral-200/70 bg-white/90 text-center shadow-none">
            <CardContent className="space-y-7 px-10 py-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-neutral-200/70 bg-neutral-50">
                <ShoppingBag className="h-8 w-8 text-neutral-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-neutral-900">Корзина пока пуста</h2>
                <p className="text-sm text-neutral-500">Добавьте техники из каталога — мы зарезервируем оборудование и подготовим доставку.</p>
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
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              {items.map((item) => (
                <Card key={item.productId} className="rounded-[32px] border border-neutral-200/70 bg-white/95 shadow-[0_45px_140px_-110px_rgba(15,15,15,0.5)]">
                  <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
                    <div className="relative h-36 w-full overflow-hidden rounded-[24px] border border-neutral-200/70 bg-neutral-100 md:h-32 md:w-40">
                      <ProductImage src={item.image} alt={item.title} />
                    </div>
                    <div className="flex flex-1 flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold leading-tight text-neutral-900">{item.title}</h3>
                        <div className="text-sm text-neutral-500">{formatCurrency(item.price, item.currency)} за единицу</div>
                      </div>
                      <div className="flex flex-col-reverse gap-5 md:flex-row md:items-center md:gap-8">
                        <div className="flex items-center gap-3 rounded-full border border-neutral-200/70 bg-neutral-50 px-4 py-2">
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-neutral-500 transition hover:border-neutral-900/40 hover:text-neutral-900"
                            onClick={() => setQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            aria-label="Уменьшить количество"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-[2.5rem] text-center text-lg font-semibold text-neutral-900">{item.quantity}</span>
                          <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-neutral-500 transition hover:border-neutral-900/40 hover:text-neutral-900"
                            onClick={() => setQuantity(item.productId, item.quantity + 1)}
                            aria-label="Увеличить количество"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-3">
                          <div className="text-lg font-semibold text-neutral-900">
                            {formatCurrency(item.price * item.quantity, item.currency)}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="gap-2 rounded-full border border-transparent text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400 transition hover:border-red-200 hover:text-red-500"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Удалить
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="h-fit rounded-[32px] border border-neutral-200/70 bg-white/95 shadow-[0_55px_150px_-110px_rgba(15,15,15,0.4)]">
              <CardHeader className="space-y-2">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-neutral-400">Итого по заказу</span>
                <CardTitle className="text-2xl font-semibold text-neutral-900">{formatCurrency(summary.total, currency)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 text-sm text-neutral-500">
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-[0.35em]">Товары</span>
                    <span className="font-medium text-neutral-900">{formatCurrency(summary.subtotal, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-[0.35em]">Доставка</span>
                    <span>{summary.delivery === 0 ? "Бесплатно" : formatCurrency(summary.delivery, currency)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button asChild size="lg" className="h-12 w-full rounded-full text-xs font-semibold uppercase tracking-[0.45em]">
                    <Link href="/shop/checkout">Перейти к оформлению</Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="h-12 w-full rounded-full border border-neutral-300/80 bg-white text-xs font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    <Link href="/shop">Продолжить покупки</Link>
                  </Button>
                </div>
                <p className="text-xs leading-relaxed text-neutral-400">
                  После оформления мы свяжемся с вами для подтверждения адреса и времени доставки. Вы также сможете обсудить дополнительные услуги сервиса.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </BaseContainer>
      </main>
    </>
  );
}
