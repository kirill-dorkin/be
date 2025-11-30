import { getTranslations } from "next-intl/server";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

export const DeliveryMethodSection = async ({
  checkout,
}: {
  checkout: Checkout;
}) => {
  const t = await getTranslations("delivery-method");
  const tc = await getTranslations("common");

  return (
    <section className="border-border/60 bg-card rounded-xl border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h3 className="text-foreground text-lg font-semibold sm:text-xl">
            {t("title")}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {checkout.deliveryMethod?.name || t("select-delivery-method")}
          </p>
        </div>
        {checkout.deliveryMethod && (
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <LocalizedLink href={paths.checkout.deliveryMethod.asPath()}>
              {tc("edit")}
            </LocalizedLink>
          </Button>
        )}
      </div>
    </section>
  );
};
