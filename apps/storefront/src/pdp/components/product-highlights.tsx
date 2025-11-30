import { Truck, Undo2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { type Product } from "@nimara/domain/objects/Product";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@nimara/ui/components/alert";

type Props = {
  product: Product;
};

export const ProductHighlights = async (props: Props) => {
  const t = await getTranslations("products");

  const { hasFreeShipping, hasFreeReturn } = props.product.attributes.reduce(
    (acc, attr) => {
      if (attr.slug === "free-shipping" && attr.values.some((v) => v.boolean)) {
        acc.hasFreeShipping = true;
      }

      if (attr.slug === "free-return" && attr.values.some((v) => v.boolean)) {
        acc.hasFreeReturn = true;
      }

      return acc;
    },
    { hasFreeShipping: false, hasFreeReturn: false },
  );

  if (!hasFreeShipping && !hasFreeReturn) {
    return null;
  }

  return (
    <div className="border-border/30 my-8 space-y-3 border-t pt-6 dark:border-white/10">
      {hasFreeShipping && (
        <Alert className="border-green-200 bg-green-50/50 text-slate-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-100">
          <Truck className="size-4" />
          <AlertTitle className="font-semibold">
            {t("free-shipping")}
          </AlertTitle>
          <AlertDescription>{t("standard-parcel")}</AlertDescription>
        </Alert>
      )}

      {hasFreeReturn && (
        <Alert className="border-blue-200 bg-blue-50/50 text-slate-700 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-100">
          <Undo2 className="size-4" />
          <AlertTitle className="font-semibold">{t("free-30-days")}</AlertTitle>
        </Alert>
      )}
    </div>
  );
};
