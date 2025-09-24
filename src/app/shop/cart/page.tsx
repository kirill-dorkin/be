"use client";

import Link from "next/link";
import { useMemo } from "react";
import BaseContainer from "@/shared/ui/BaseContainer";
import { useCart } from "@/providers/CartProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
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

  const summary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = subtotal > 20000 ? 0 : subtotal > 0 ? 590 : 0;
    return { subtotal, delivery, total: subtotal + delivery };
  }, [items]);

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <BaseContainer className="space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Корзина</h1>
            <p className="text-sm text-muted-foreground">Просматривайте товары, редактируйте количество и оформляйте заказ</p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" className="rounded-2xl" onClick={clearCart}>
              Очистить корзину
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <Card className="mx-auto w-full max-w-lg border border-dashed border-border/70 bg-white/90 text-center shadow-none">
            <CardContent className="space-y-6 py-12">
              <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Корзина пока пуста</h2>
                <p className="text-sm text-muted-foreground">
                  Добавьте товары из каталога, чтобы оформить заказ и забронировать оборудование.
                </p>
              </div>
              <Button asChild className="rounded-2xl px-6">
                <Link href="/shop">Вернуться в магазин</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.productId} className="border border-border/60 bg-white/95 shadow-sm">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-border/60 bg-slate-100 md:h-28 md:w-32">
                        <ProductImage src={item.image} alt={item.title} />
                      </div>
                      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold leading-tight">{item.title}</h3>
                          <div className="text-sm text-muted-foreground">Цена: {formatCurrency(item.price, item.currency)}</div>
                        </div>
                        <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:gap-6">
                          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-slate-50 px-3 py-2 md:w-40">
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-foreground transition hover:border-primary"
                              onClick={() => setQuantity(item.productId, Math.max(1, item.quantity - 1))}
                              aria-label="Уменьшить количество"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-[2.5rem] text-center text-lg font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-foreground transition hover:border-primary"
                              onClick={() => setQuantity(item.productId, item.quantity + 1)}
                              aria-label="Увеличить количество"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-2">
                            <div className="text-lg font-semibold text-foreground">
                              {formatCurrency(item.price * item.quantity, item.currency)}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-sm text-muted-foreground hover:text-destructive"
                              onClick={() => removeFromCart(item.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Удалить
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="h-fit border border-border/70 bg-white/95 shadow-lg shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-xl">Итого</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Товары</span>
                    <span className="font-medium text-foreground">{formatCurrency(summary.subtotal, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Доставка</span>
                    <span>{summary.delivery === 0 ? "Бесплатно" : formatCurrency(summary.delivery, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold text-foreground">
                    <span>К оплате</span>
                    <span>{formatCurrency(summary.total, currency)}</span>
                  </div>
                </div>
                <Button asChild className="w-full rounded-2xl py-3 text-base font-semibold">
                  <Link href="/shop/checkout">Перейти к оформлению</Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-2xl">
                  <Link href="/shop">Продолжить покупки</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  После оформления менеджер свяжется с вами для подтверждения заказа и уточнения времени доставки.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </BaseContainer>
    </main>
  );
}
