import Link from "next/link";

import { Button } from "@nimara/ui/components/button";

const SellerDashboardPage = () => {
  return (
    <div className="container max-w-5xl pb-16 pt-10">
      <div className="flex flex-col gap-2 pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Маркетплейс
        </p>
        <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
          Кабинет продавца
        </h1>
        <p className="text-muted-foreground text-base">
          Управляйте товарами, следите за модерацией и публикуйте новые позиции.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-foreground">Статус продавца</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Профиль продавца: <strong>Кирилл Доркин</strong>. Товары на витрине уже закреплены за этим профилем.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-emerald-800 ring-1 ring-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Активен
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-foreground">Выплаты</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Реквизиты и выплаты подключаются через профиль. Добавим интеграцию после предоставления данных.
          </p>
          <div className="mt-4 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            TODO: привязать реквизиты к аккаунту Кирилл Доркин
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Мои товары</h2>
            <p className="text-muted-foreground text-sm">
              Публикация идёт через модерацию. Новые заявки отправляйте через форму.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/sell">Выставить новый товар</Link>
          </Button>
        </div>

        <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/40 p-4">
            Список товаров появится после подключения постоянного хранилища (Saleor API / БД).
          </div>
          <p>
            Сейчас все товары витрины закреплены за продавцом <strong>Кирилл Доркин</strong>, что видно на карточках
            (бейдж на странице товара).
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
