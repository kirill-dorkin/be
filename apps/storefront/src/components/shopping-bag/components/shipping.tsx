"use client";

import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";

import { type ShoppingBagPriceProps } from "./shopping-bag-price";

const ShippingComponent = (props: Pick<ShoppingBagPriceProps, "price">) => {
  const t = useTranslations();
  const formatter = useLocalizedFormatter();

  // Мемоизация текста доставки
  const shippingText = useMemo(() => {
    if (props?.price && props.price.amount > 0) {
      return formatter.price({ amount: props.price.amount });
    }
    
return t("common.free");
  }, [props?.price, formatter, t]);

  return (
    <div
      className="text-content text-foreground flex justify-between text-sm"
      data-testid="shopping-bag-price-delivery-method"
    >
      <p>{t("delivery-method.title")}</p>
      <p>{shippingText}</p>
    </div>
  );
};

// Мемоизация - используется в корзине и чекауте
export const Shipping = memo(ShippingComponent, (prevProps, nextProps) => {
  return prevProps.price?.amount === nextProps.price?.amount;
});

Shipping.displayName = "Shipping";
