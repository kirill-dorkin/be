"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

import BaseContainer from "@/shared/ui/BaseContainer";
import { useCart } from "@/providers/CartProvider";
import shopService from "@/services/shopService";
import ClientHeader from "@/widgets/header/ClientHeader";
import { ProductImage } from "../_components/ProductImage";

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
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
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
    <>
      <ClientHeader />
      <main className="flex min-h-screen flex-col bg-white pt-[var(--header-height)]">
        <BaseContainer className="space-y-12 py-16">
        <section className="rounded-[48px] border border-neutral-200/70 bg-white px-10 py-12 shadow-[0_60px_180px_-120px_rgба(15,15,15,0.5)]">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-neutral-400">Шаг 2</span>
              <div className="space-y-3">
                <h1 className="text-[clamp(2.4rem,5vw,3.6rem)] font-light tracking-tight text-neutral-900">Оформление заказа</h1>
                <p className="max-w-3xl text-sm leading-relaxed text-neutral-500">
                  Уточните контакты и адрес доставки. После отправки заявки менеджер подтвердит детали и предложит дату отгрузки.
                </p>
              </div>
            </div>
            <div className="rounded-[28px] border border-neutral-200/70 bg-neutral-50/80 px-6 py-4 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">Итого к оплате</p>
              <p className="text-[2rem] font-light tracking-tight text-neutral-900">{formatCurrency(grandTotal, currency)}</p>
              <p className="text-xs text-neutral-500">{itemCount.toLocaleString("ru-RU")} позиций</p>
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <Card className="mx-auto max-w-3xl rounded-[40px] border border-dashed border-neutral-200/70 bg-white/95 text-center">
            <CardContent className="space-y-7 px-10 py-16">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-neutral-900">Корзина пуста</h2>
                <p className="text-sm text-neutral-500">Добавьте товары перед оформлением — мы подготовим счёт и резерв.</p>
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
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <div className="space-y-8">
              <Card className="rounded-[36px] border border-neutral-200/70 bg-white/95 shadow-[0_45px_140px_-110px_rgба(15,15,15,0.45)]">
                <CardHeader className="space-y-2">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-neutral-400">1. Контакты</span>
                  <CardTitle className="text-2xl font-semibold text-neutral-900">Как с вами связаться</CardTitle>
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
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="comment">Комментарий к заказу</Label>
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

              <Card className="rounded-[36px] border border-neutral-200/70 bg-white/95 shadow-[0_45px_140px_-110px_rgба(15,15,15,0.45)]">
                <CardHeader className="space-y-2">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-neutral-400">2. Доставка</span>
                  <CardTitle className="text-2xl font-semibold text-neutral-900">Куда привезти технику</CardTitle>
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

            <Card className="h-fit rounded-[36px] border border-neutral-200/70 bg-white/95 shadow-[0_55px_150px_-110px_rgба(15,15,15,0.4)]">
              <CardHeader className="space-y-2">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-neutral-400">3. Проверка</span>
                <CardTitle className="text-2xl font-semibold text-neutral-900">Сводка заказа</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 rounded-[28px] border border-neutral-200/70 bg-neutral-50/70 p-4"
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-[20px] border border-neutral-200/60 bg-white">
                        <ProductImage src={item.image} alt={item.title} />
                      </div>
                      <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
                        <div className="min-w-[8rem] space-y-1">
                          <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                          <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">x{item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium text-neutral-900">
                          {formatCurrency(item.price * item.quantity, item.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 rounded-[28px] border border-neutral-200/70 bg-white px-6 py-5 text-sm text-neutral-500">
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-[0.35em]">Товары</span>
                    <span className="font-medium text-neutral-900">{formatCurrency(total, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-[0.35em]">Доставка</span>
                    <span>{delivery === 0 ? "Бесплатно" : formatCurrency(delivery, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold text-neutral-900">
                    <span className="uppercase tracking-[0.35em]">Итого</span>
                    <span>{formatCurrency(grandTotal, currency)}</span>
                  </div>
                </div>

                <div className="space-y-3 rounded-[28px] border border-neutral-200/70 bg-neutral-50/80 px-5 py-4 text-xs text-neutral-500">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agree"
                      checked={form.agree}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, agree: Boolean(checked) }))
                      }
                      className="mt-0.5"
                    />
                    <Label htmlFor="agree" className="text-xs font-normal leading-relaxed text-neutral-500">
                      Я соглашаюсь на обработку персональных данных и подтверждаю, что ознакомился с условиями доставки и оплаты.
                    </Label>
                  </div>
                  {errors.agree && <p className="text-xs text-destructive">{errors.agree}</p>}
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full rounded-full text-xs font-semibold uppercase tracking-[0.45em]"
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
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="h-12 w-full rounded-full border border-neutral-300/80 bg-white text-xs font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    <Link href="/shop/cart">Вернуться в корзину</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
        </BaseContainer>
      </main>
    </>
  );
}
