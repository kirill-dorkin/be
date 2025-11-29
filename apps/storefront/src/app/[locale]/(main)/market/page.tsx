import Link from "next/link";

import { ArrowRight, Award, CheckCircle2, ShieldCheck, Store } from "lucide-react";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@nimara/ui/components/card";

import { DEFAULT_RESULTS_PER_PAGE } from "@/config";
import { SearchProductCard } from "@/components/search-product-card";
import { SellerChip } from "@/components/seller-chip";
import { getCurrentRegion } from "@/regions/server";
import { getSearchService } from "@/services/search";

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

const fetchMarketplaceProducts = async () => {
  const region = await getCurrentRegion();
  const searchService = await getSearchService();

  const searchResult = await searchService.search(
    {
      query: "",
      limit: 6,
      sortBy: "name-asc",
      filters: {},
    },
    {
      currency: region.market.currency,
      channel: region.market.channel,
      languageCode: region.language.code,
    },
  );

  if (!searchResult.ok) {
    return [];
  }

  return searchResult.data.results;
};

const MarketplacePage = async () => {
  const products = await fetchMarketplaceProducts();

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
              Оформление в стиле сайта, модерация и прозрачная подача. Все текущие товары закреплены за компанией BestElectronics — ваш профиль может быть следующим.
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
            <p className="text-muted-foreground mt-1 text-sm">BestElectronics — текущая витрина принадлежит компании.</p>
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
            Реальные товары из витрины. Все карточки закреплены за продавцом <strong>BestElectronics</strong>.
          </p>
        </div>
        {products.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="group space-y-2 rounded-2xl border border-border/60 bg-muted/30 p-3">
                <SearchProductCard product={product} />
                <SellerChip name="BestElectronics" href="/market/bestelectronics" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
            Не удалось загрузить товары. Попробуйте позже.
          </div>
        )}
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

      <div className="mt-10 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm">
        <div className="flex flex-col gap-2 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Продавцы</h2>
            <p className="text-muted-foreground text-sm">
              Сейчас витрина закреплена за продавцом BestElectronics. Добавим больше профилей после подключения CRM.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/sell">Стать продавцом</Link>
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 shadow-sm">
            <SellerChip
              name="BestElectronics"
              className="w-full justify-center"
              href="/market/bestelectronics"
            />
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p>Активный продавец маркетплейса.</p>
              <p>Товары: вся текущая витрина компании.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
            Скоро: список продавцов, быстрый поиск и фильтр по продавцу на витрине.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
