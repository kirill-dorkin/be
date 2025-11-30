import { getTranslations } from "next-intl/server";

import type { Order } from "@nimara/domain/objects/Order";

import { getLocalizedFormatter } from "@/lib/formatters/get-localized-formatter";
import { cn } from "@/lib/utils";

export const OrderSummary = async ({
  order,
  withStatus,
}: {
  order: Order;
  withStatus?: boolean;
}) => {
  const [t, formatter] = await Promise.all([
    getTranslations(),
    getLocalizedFormatter(),
  ]);

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-0",
        withStatus ? "sm:grid-cols-8" : "sm:grid-cols-6",
      )}
    >
      <div className="col-span-2">
        <p className="dark:text-muted-foreground text-stone-500">
          {t("order.order-number")}
        </p>
        <p className="dark:text-primary text-slate-700">{order.number}</p>
      </div>
      <div className="col-span-2">
        <p className="dark:text-muted-foreground text-stone-500">
          {t("order.total")}
        </p>
        <p className="dark:text-primary text-slate-700">
          {formatter.price({
            amount: order.total.amount,
          })}
        </p>
      </div>
      <div className="col-span-2">
        <p className="dark:text-muted-foreground text-stone-500">
          {t("order.date-ordered")}
        </p>
        <p className="dark:text-primary text-slate-700">
          {formatter.date({
            date: order.created,
            options: {
              weekday: "short",
              month: "2-digit",
              year: "numeric",
              day: "2-digit",
            },
          })}
        </p>
      </div>
      {withStatus && (
        <div className="col-span-2">
          <p className="dark:text-muted-foreground text-stone-500">
            {t("order.order-status")}
          </p>
          <p className="dark:text-primary text-slate-700">{order.status}</p>
        </div>
      )}
    </div>
  );
};
