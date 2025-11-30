import { type Metadata } from "next";

import { getCurrentRegion } from "@/regions/server";
import { getNavigationMenu } from "@/services/navigation-menu";

import { SellForm } from "./sell-form";

export const metadata: Metadata = {
  title: "Выставить товар",
  description: "Разместите свой товар на BestElectronics",
};

const SellPage = async () => {
  const region = await getCurrentRegion();
  const menuResult = await getNavigationMenu({
    channel: region.market.channel,
    languageCode: region.language.code,
  });

  // Берём только подкатегории из навигации, чтобы выбор был точнее
  const categories = Array.from(
    new Set(
      (menuResult.data?.menu?.items || []).flatMap(
        (item) => item.children?.map((child) => child.label) ?? [],
      ),
    ),
  ).filter(Boolean);

  return (
    <div className="container max-w-4xl pb-16 pt-10">
      <div className="flex flex-col gap-2 pb-6">
        <p className="text-muted-foreground text-sm font-semibold uppercase tracking-[0.12em]">
          Маркетплейс
        </p>
        <h1 className="text-foreground text-3xl font-bold leading-tight md:text-4xl">
          Выставить товар
        </h1>
        <p className="text-muted-foreground text-base">
          Заполните форму, и мы опубликуем карточку товара. Публикация сейчас
          идёт через модерацию.
        </p>
      </div>

      <SellForm categories={categories} />

      <div className="border-border/60 bg-muted/30 text-muted-foreground mt-8 rounded-xl border p-4 text-sm">
        После отправки заявка уходит модератору (Telegram). Текущая витрина
        принадлежит компании BestElectronics.
      </div>
    </div>
  );
};

export default SellPage;
