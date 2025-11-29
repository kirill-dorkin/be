import Link from "next/link";

import { ArrowRight, Award, CheckCircle2, ShieldCheck, Store } from "lucide-react";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@nimara/ui/components/card";

const sampleProducts = [
  {
    title: "Беспроводные наушники",
    price: "3 490 с",
    seller: "Кирилл Доркин",
    category: "Аудио",
  },
  {
    title: "Видеокарта RTX 3060",
    price: "21 500 с",
    seller: "Кирилл Доркин",
    category: "Комплектующие",
  },
  {
    title: "Смарт-часы",
    price: "5 990 с",
    seller: "Кирилл Доркин",
    category: "Гаджеты",
  },
];

const benefits = [
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Модерация и защита",
    desc: "Каждая карточка проходит проверку, чтобы покупатели доверяли.",
  },
  {
    icon: <Award className="h-5 w-5" />,
    title: "Единый стиль витрины",
    desc: "Карточки оформлены в дизайне BestElectronics — аккуратно и понятно.",
  },
  {
    icon: <CheckCircle2 className="h-5 w-5" />,
    title: "Простая публикация",
    desc: "Форма на сайте — отправка в один шаг, поддержка через Telegram.",
  },
];

const steps = [
  "Заполните карточку товара на странице «Выставить товар».",
  "Дождитесь модерации — заявка приходит в Telegram.",
  "После подтверждения товар попадает на витрину.",
];

const MarketplacePage = () => {
  return (
    <div className="container max-w-6xl pb-16 pt-10">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-background via-muted/60 to-background px-6 py-8 shadow-sm md:px-10 md:py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Marketplace
            </p>
            <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
              Продавайте свои товары на BestElectronics
            </h1>
            <p className="text-muted-foreground text-base">
              Оформление в стиле сайта, модерация и прозрачная подача. Все текущие товары закреплены за Кириллом Доркиным — ваш профиль может быть следующим.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link href="/sell">
                  Выставить товар
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/sell/dashboard">Кабинет продавца</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/70 px-4 py-3 text-sm text-foreground shadow-sm">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <span className="font-semibold">Продавец недели</span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">Кирилл Доркин — все витринные товары за ним.</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {benefits.map((item) => (
          <Card key={item.title} className="h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                {item.icon}
              </div>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">{item.desc}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm">
        <div className="flex flex-col gap-2 pb-4">
          <h2 className="text-xl font-semibold text-foreground">Витрина маркетплейса</h2>
          <p className="text-muted-foreground text-sm">
            Пример карточек в общем стиле. После подключения данных будут отображаться реальные товары.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {sampleProducts.map((product) => (
            <div
              key={product.title}
              className="rounded-xl border border-border/60 bg-muted/40 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                {product.category}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{product.title}</h3>
              <p className="text-muted-foreground text-sm">Продавец: {product.seller}</p>
              <p className="mt-3 text-xl font-semibold text-foreground">{product.price}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-4 rounded-2xl border border-border/60 bg-muted/30 p-6 shadow-sm md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Как это работает</h2>
          <ul className="text-muted-foreground space-y-2 text-sm">
            {steps.map((step) => (
              <li key={step} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                {step}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-dashed border-border/70 bg-card/60 p-4 text-sm text-muted-foreground">
          После подключения к Saleor API добавим:
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Создание/редактирование товаров прямо из кабинета.</li>
            <li>Статусы модерации и публикации.</li>
            <li>Списки реальных товаров от продавцов.</li>
            <li>Фильтр по продавцам на витрине.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
