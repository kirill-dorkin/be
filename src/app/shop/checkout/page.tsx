"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BaseContainer from "@/shared/ui/BaseContainer";
import { useCart } from "@/providers/CartProvider";
import shopService from "@/services/shopService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface CheckoutForm {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  comment?: string;
  agree: boolean;
}

const INITIAL_FORM: CheckoutForm = {
  fullName: "",
  phone: "",
  email: "",
  country: "Кыргызстан",
  city: "Бишкек",
  addressLine1: "",
  addressLine2: "",
  comment: "",
  agree: false,
};

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});

  const currency = items[0]?.currency ?? "RUB";
  const delivery = total > 20000 ? 0 : total > 0 ? 590 : 0;
  const grandTotal = total + delivery;

  const validate = () => {
    const nextErrors: Partial<Record<keyof CheckoutForm, string>> = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Укажите ФИО";
    if (!form.phone.trim()) nextErrors.phone = "Введите номер телефона";
    if (!form.email.trim()) nextErrors.email = "Укажите электронную почту";
    if (!form.addressLine1.trim()) nextErrors.addressLine1 = "Введите адрес доставки";
    if (!form.agree) nextErrors.agree = "Необходимо согласие на обработку данных";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const created = await shopService.createOrder({
        items,
        total: grandTotal,
        currency,
        address: {
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          country: form.country,
          city: form.city,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          postalCode: undefined,
        },
      });
      clearCart();
      router.push(`/shop/success/${created._id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <BaseContainer className="space-y-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold">Оформление заказа</h1>
          <p className="text-sm text-muted-foreground">
            Заполните контактные данные и адрес доставки. Менеджер перезвонит для подтверждения заказа.
          </p>
        </div>

        {items.length === 0 ? (
          <Card className="border border-dashed border-border/70 bg-white/95 text-center">
            <CardContent className="space-y-6 py-12">
              <p className="text-lg font-semibold">Корзина пуста</p>
              <p className="text-sm text-muted-foreground">Добавьте товары перед оформлением заказа.</p>
              <Button asChild className="rounded-2xl px-6">
                <Link href="/shop">Перейти к каталогу</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]">
            <div className="space-y-6">
              <Card className="border border-border/70 bg-white/95 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Контактные данные</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">ФИО*</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                      placeholder="Например, Иванов Иван"
                    />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон*</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="+996 700 000 000"
                    />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email*</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Комментарий</Label>
                    <Textarea
                      id="comment"
                      value={form.comment}
                      onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
                      rows={3}
                      placeholder="Уточните пожелания по доставке или комплектации"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/70 bg-white/95 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Адрес доставки</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">Страна</Label>
                    <Input
                      id="country"
                      value={form.country}
                      onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Город</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="addressLine1">Адрес*</Label>
                    <Input
                      id="addressLine1"
                      value={form.addressLine1}
                      onChange={(event) => setForm((prev) => ({ ...prev, addressLine1: event.target.value }))}
                      placeholder="Улица, дом, подъезд"
                    />
                    {errors.addressLine1 && <p className="text-xs text-destructive">{errors.addressLine1}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="addressLine2">Дополнительная информация</Label>
                    <Input
                      id="addressLine2"
                      value={form.addressLine2}
                      onChange={(event) => setForm((prev) => ({ ...prev, addressLine2: event.target.value }))}
                      placeholder="Квартира, офис, домофон"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="h-fit border border-border/70 bg-white/95 shadow-lg shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-xl">Сводка заказа</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Товары ({items.length})</span>
                    <span className="font-medium text-foreground">{formatCurrency(total, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Доставка</span>
                    <span>{delivery === 0 ? "Бесплатно" : formatCurrency(delivery, currency)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-base font-semibold text-foreground">
                    <span>Итого</span>
                    <span>{formatCurrency(grandTotal, currency)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-xs text-muted-foreground">
                  <Checkbox
                    id="agree"
                    checked={form.agree}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({ ...prev, agree: Boolean(checked) }))
                    }
                  />
                  <Label htmlFor="agree" className="text-xs font-normal leading-relaxed text-muted-foreground">
                    Я соглашаюсь на обработку персональных данных и подтверждаю, что ознакомился с условиями доставки и оплаты.
                  </Label>
                </div>
                {errors.agree && <p className="text-xs text-destructive">{errors.agree}</p>}

                <Button
                  type="submit"
                  className="w-full rounded-2xl py-3 text-base font-semibold"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Оформляем заказ...
                    </>
                  ) : (
                    "Подтвердить заказ"
                  )}
                </Button>
                <Button asChild variant="outline" className="w-full rounded-2xl">
                  <Link href="/shop/cart">Вернуться в корзину</Link>
                </Button>
              </CardContent>
            </Card>
          </form>
        )}
      </BaseContainer>
    </main>
  );
}
