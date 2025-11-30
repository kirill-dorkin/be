import {
  ArrowRight,
  Award,
  CheckCircle2,
  ShieldCheck,
  Store,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { SearchProductCard } from "@/components/search-product-card";
import { SellerChip } from "@/components/seller-chip";
import { loadMarketplaceListings } from "@/lib/marketplace-storage";
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
  const listings = (await loadMarketplaceListings()).filter(
    (item) => item.status === "published",
  );
  const adminBadge = (
    <div className="border-border/50 bg-card/70 text-foreground rounded-2xl border px-4 py-3 text-sm shadow-sm">
      <div className="flex items-center gap-2">
        <Store className="text-primary h-5 w-5" />
        <span className="font-semibold">Продавец недели</span>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        BestElectronics — текущая витрина принадлежит компании.
      </p>
    </div>
  );

  return (
    <div className="container max-w-6xl pb-16 pt-10">
      <div className="border-border/60 from-background via-muted/60 to-background rounded-3xl border bg-gradient-to-br px-6 py-8 shadow-sm md:px-10 md:py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-muted-foreground text-sm font-semibold uppercase tracking-[0.14em]">
              Marketplace
            </p>
            <h1 className="text-foreground text-3xl font-bold leading-tight md:text-4xl">
              Продавайте свои товары на BestElectronics
            </h1>
            <p className="text-muted-foreground text-base">
              Оформление в стиле сайта, модерация и прозрачная подача. Все
              текущие товары закреплены за компанией BestElectronics — ваш
              профиль может быть следующим.
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
          {adminBadge}
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {benefits.map((item) => (
          <Card key={item.title} className="h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                {item.icon}
              </div>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground pt-0 text-sm">
              {item.desc}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border-border/60 bg-card/70 mt-12 rounded-2xl border p-6 shadow-sm">
        <div className="flex flex-col gap-2 pb-4">
          <h2 className="text-foreground text-xl font-semibold">
            Витрина маркетплейса
          </h2>
          <p className="text-muted-foreground text-sm">
            Реальные товары из витрины. Все карточки закреплены за продавцом{" "}
            <strong>BestElectronics</strong>.
          </p>
        </div>
        {products.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="border-border/60 bg-muted/30 group space-y-2 rounded-2xl border p-3"
              >
                <SearchProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="border-border/70 bg-muted/40 text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
            Не удалось загрузить товары. Попробуйте позже.
          </div>
        )}
      </div>

      {listings.length > 0 && (
        <div className="border-border/60 bg-card/70 mt-12 rounded-2xl border p-6 shadow-sm">
          <div className="flex flex-col gap-2 pb-4">
            <h2 className="text-foreground text-xl font-semibold">
              Товары продавцов
            </h2>
            <p className="text-muted-foreground text-sm">
              Опубликованные после модерации. Добавление — через форму,
              модерация — через кабинет администратора.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="border-border/60 bg-muted/30 rounded-2xl border p-4 shadow-sm"
              >
                <div className="bg-primary/10 text-primary mb-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
                  {listing.category}
                </div>
                <h3 className="text-foreground line-clamp-2 text-lg font-semibold">
                  {listing.title}
                </h3>
                <p className="text-muted-foreground line-clamp-3 text-sm">
                  {listing.description}
                </p>
                <p className="text-foreground mt-3 text-xl font-semibold">
                  {listing.price} с
                </p>
                <SellerChip
                  name={listing.userName || "Продавец"}
                  className="mt-3"
                  href="/market/moderation"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-border/60 bg-muted/30 mt-10 grid gap-4 rounded-2xl border p-6 shadow-sm md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-2">
          <h2 className="text-foreground text-xl font-semibold">
            Как это работает
          </h2>
          <ul className="text-muted-foreground space-y-2 text-sm">
            {steps.map((step) => (
              <li key={step} className="flex gap-2">
                <span className="bg-primary mt-1 h-1.5 w-1.5 rounded-full" />
                {step}
              </li>
            ))}
          </ul>
        </div>
        <div className="border-border/70 bg-card/60 text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
          После подключения к Saleor API добавим:
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Создание/редактирование товаров прямо из кабинета.</li>
            <li>Статусы модерации и публикации.</li>
            <li>Списки реальных товаров от продавцов.</li>
            <li>Фильтр по продавцам на витрине.</li>
          </ul>
        </div>
      </div>

      <div className="border-border/60 bg-card/70 mt-10 rounded-2xl border p-6 shadow-sm">
        <div className="flex flex-col gap-2 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-foreground text-xl font-semibold">Продавцы</h2>
            <p className="text-muted-foreground text-sm">
              Сейчас витрина закреплена за продавцом BestElectronics. Добавим
              больше профилей после подключения CRM.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/sell">Стать продавцом</Link>
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="border-border/60 bg-muted/30 rounded-2xl border p-4 shadow-sm">
            <SellerChip
              name="BestElectronics"
              className="w-full justify-center"
              href="/market/bestelectronics"
            />
            <div className="text-muted-foreground mt-3 space-y-1 text-sm">
              <p>Активный продавец маркетплейса.</p>
              <p>Товары: вся текущая витрина компании.</p>
            </div>
          </div>
          <div className="border-border/60 bg-muted/20 text-muted-foreground rounded-2xl border border-dashed p-4 text-sm">
            Скоро: список продавцов, быстрый поиск и фильтр по продавцу на
            витрине.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
