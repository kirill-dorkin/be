import { redirect } from "next/navigation";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import { auth } from "@/auth";
import { loadMarketplaceListings } from "@/lib/marketplace-storage";
import { paths } from "@/lib/paths";

import { approveListingAction, rejectListingAction } from "./actions";

const ModerationPage = async () => {
  const session = await auth();

  if (!session?.user || !(session.user as { isStaff?: boolean }).isStaff) {
    redirect(paths.signIn.asPath());
  }

  const listings = await loadMarketplaceListings();

  const pending = listings.filter((item) => item.status === "pending");
  const published = listings.filter((item) => item.status === "published");
  const rejected = listings.filter((item) => item.status === "rejected");

  const renderList = (items: typeof listings) => {
    if (!items.length) {
      return (
        <div className="border-border/70 bg-muted/40 text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
          Нет заявок.
        </div>
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="h-full">
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              <p>
                Цена: <strong>{item.price}</strong>
              </p>
              <p>Категория: {item.category}</p>
              <p className="line-clamp-3">{item.description}</p>
              {item.photoUrl && (
                <a
                  className="text-primary hover:underline"
                  href={item.photoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Фото
                </a>
              )}
              <p className="text-foreground text-xs">Контакт: {item.contact}</p>
              {item.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <form action={approveListingAction.bind(null, item.id)}>
                    <Button size="sm" type="submit" variant="default">
                      Одобрить
                    </Button>
                  </form>
                  <form action={rejectListingAction.bind(null, item.id)}>
                    <Button size="sm" type="submit" variant="destructive">
                      Отклонить
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container max-w-6xl pb-16 pt-10">
      <div className="flex flex-col gap-2 pb-6">
        <p className="text-muted-foreground text-sm font-semibold uppercase tracking-[0.12em]">
          Маркетплейс
        </p>
        <h1 className="text-foreground text-3xl font-bold leading-tight md:text-4xl">
          Модерация заявок
        </h1>
        <p className="text-muted-foreground text-base">
          Только сотрудники могут одобрять или отклонять товары перед
          публикацией.
        </p>
      </div>

      <div className="space-y-6">
        <div className="border-border/60 bg-card/70 rounded-2xl border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">
              В ожидании
            </h2>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              {pending.length}
            </span>
          </div>
          <div className="mt-4">{renderList(pending)}</div>
        </div>

        <div className="border-border/60 bg-card/70 rounded-2xl border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">
              Опубликовано
            </h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              {published.length}
            </span>
          </div>
          <div className="mt-4">{renderList(published)}</div>
        </div>

        <div className="border-border/60 bg-card/70 rounded-2xl border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">Отклонено</h2>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
              {rejected.length}
            </span>
          </div>
          <div className="mt-4">{renderList(rejected)}</div>
        </div>
      </div>
    </div>
  );
};

export default ModerationPage;
