import { getTranslations } from "next-intl/server";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nimara/ui/components/tabs";

import { getAccessToken } from "@/auth";
import { isOrderLineReturned } from "@/lib/order";
import { getCurrentRegion } from "@/regions/server";
import { getUserService } from "@/services/user";

import { OrderDocuments } from "./_components/order-documents";
import { OrderLine } from "./_components/order-line";
import { OrderSummary } from "./_components/order-summary";
import { ReturnProductsModal } from "./_components/return-products-modal";

export default async function Page() {
  const [accessToken, t, region, userService] = await Promise.all([
    getAccessToken(),
    getTranslations(),
    getCurrentRegion(),
    getUserService(),
  ]);
  const languageCode = region.language.code;
  const resultOrders = await userService.ordersGet({
    accessToken,
    languageCode,
  });

  const orders = resultOrders.ok ? resultOrders.data : [];

  return (
    <div className="flex flex-col gap-6 text-sm">
      <h2 className="text-slate-700 dark:text-primary text-2xl">
        {t("account.order-history")}
      </h2>
      {orders.length === 0 && (
        <div className="space-y-8">
          <hr />
          <p className="dark:text-muted-foreground text-stone-500">
            {t("order.sorry-you-dont-have-any-orders")}
          </p>
        </div>
      )}

      {orders.map((order) => {
        const activeLines = order.lines.filter(
          (line) => !isOrderLineReturned(order, line),
        );
        const showReturnButton =
          (order.status === "FULFILLED" ||
            order.status === "PARTIALLY_RETURNED") &&
          activeLines.length > 0;

        return (
          <div className="space-y-6" key={order?.id}>
            <hr />
            <Tabs defaultValue="details" className="space-y-6">
              <TabsList className="flex w-full flex-wrap gap-2 rounded-2xl bg-muted/40 p-1">
                <TabsTrigger value="details" className="flex-1 sm:flex-none">
                  {t("order.tabs.details")}
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex-1 sm:flex-none">
                  {t("order.tabs.documents")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-6">
                <OrderSummary order={order} withStatus />
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-12 sm:items-center">
                    {order.lines.map((line) => {
                      const isReturned = isOrderLineReturned(order, line);

                      return (
                        <OrderLine
                          key={line.id}
                          line={line}
                          returnStatus={isReturned ? t("order.returned") : ""}
                        />
                      );
                    })}
                  </div>
                </div>
                {showReturnButton && (
                  <ReturnProductsModal
                    order={order}
                    orderLines={activeLines.map((line) => (
                      <OrderLine key={line.id} line={line} />
                    ))}
                  >
                    <OrderSummary order={order} />
                  </ReturnProductsModal>
                )}
              </TabsContent>
              <TabsContent value="documents">
                <OrderDocuments order={order} />
              </TabsContent>
            </Tabs>
          </div>
        );
      })}
    </div>
  );
}
