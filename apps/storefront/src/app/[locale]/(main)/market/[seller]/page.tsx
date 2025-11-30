import { ArrowLeft, Award, Store } from "lucide-react";
import Link from "next/link";

import { Button } from "@nimara/ui/components/button";

import { SearchProductCard } from "@/components/search-product-card";
import { SellerChip } from "@/components/seller-chip";
import { getCurrentRegion } from "@/regions/server";
import { getSearchService } from "@/services/search";

const fetchSellerProducts = async () => {
  const region = await getCurrentRegion();
  const searchService = await getSearchService();

  const searchResult = await searchService.search(
    {
      query: "",
      limit: 9,
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

const SellerProfilePage = async ({
  params,
}: {
  params: Promise<{ seller: string }>;
}) => {
  await params;
  const products = await fetchSellerProducts();
  const sellerName = "BestElectronics";

  return (
    <div className="container max-w-6xl pb-16 pt-8">
      <div className="text-muted-foreground mb-6 flex items-center gap-3 text-sm">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/market">
            <ArrowLeft className="h-4 w-4" />
            Маркетплейс
          </Link>
        </Button>
      </div>

      <div className="border-border/60 from-background via-muted/60 to-background rounded-3xl border bg-gradient-to-br px-6 py-8 shadow-sm md:px-10 md:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              <Store className="h-4 w-4" />
              Продавец
            </div>
            <h1 className="text-foreground text-3xl font-bold leading-tight md:text-4xl">
              {sellerName}
            </h1>
            <p className="text-muted-foreground text-base">
              Активный продавец маркетплейса. Текущая витрина принадлежит
              компании. Добавим больше продавцов после подключения
              CRM/модерации.
            </p>
            <div className="text-muted-foreground flex flex-wrap gap-2 text-sm">
              <span className="bg-card/70 ring-border/60 rounded-full px-3 py-1 ring-1">
                Рейтинг: —
              </span>
              <span className="bg-card/70 ring-border/60 rounded-full px-3 py-1 ring-1">
                Модерация включена
              </span>
            </div>
          </div>
          <SellerChip name={sellerName} />
        </div>
      </div>

      <div className="border-border/60 bg-card/70 mt-10 rounded-2xl border p-6 shadow-sm">
        <div className="flex flex-col gap-2 pb-4">
          <h2 className="text-foreground text-xl font-semibold">
            Товары продавца
          </h2>
          <p className="text-muted-foreground text-sm">
            Отображаются товары из витрины (сейчас все товары принадлежат
            компании).
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

      <div className="border-border/60 bg-muted/30 mt-10 grid gap-4 rounded-2xl border p-6 shadow-sm md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-2">
          <h2 className="text-foreground text-xl font-semibold">Что дальше</h2>
          <p className="text-muted-foreground text-sm">
            Добавим личный профиль продавца, отзывы и статусы модерации карточек
            (черновик, на проверке, опубликовано).
          </p>
        </div>
        <div className="border-border/70 bg-card/60 text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
          <div className="text-foreground flex items-center gap-2">
            <Award className="text-primary h-4 w-4" />
            Улучшения в планах
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Отдельный фильтр по продавцам на витрине.</li>
            <li>Формы редактирования и удаления товаров.</li>
            <li>Статусы модерации, уведомления, отзывы.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SellerProfilePage;
