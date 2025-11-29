import { Metadata } from "next";

import { paths } from "@/lib/paths";

import { SellForm } from "./sell-form";

export const metadata: Metadata = {
  title: "Выставить товар",
  description: "Разместите свой товар на BestElectronics",
};

const SellPage = () => {
  return (
    <div className="container max-w-4xl pb-16 pt-10">
      <div className="flex flex-col gap-2 pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Маркетплейс
        </p>
        <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
          Выставить товар
        </h1>
        <p className="text-muted-foreground text-base">
          Заполните форму, и мы опубликуем карточку товара. Публикация сейчас идёт через модерацию.
        </p>
      </div>

      <SellForm />

      <div className="mt-8 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
        После отправки заявка уходит модератору (Telegram). Профиль продавца: <strong>Кирилл Доркин</strong>.
      </div>
    </div>
  );
};

export default SellPage;
