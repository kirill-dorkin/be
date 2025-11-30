"use client";

import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

import { type Price } from "@nimara/domain/objects/common";
import { cn } from "@nimara/ui/lib/utils";

import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";

export type ShoppingBagPriceProps = {
  dataTestId?: string;
  discount?: Price;
  heading: string;
  price?: Price;
  variant?: "secondary" | "primary";
};

const ShoppingBagPriceComponent = ({
  variant = "secondary",
  price,
  discount,
  heading,
  dataTestId,
}: ShoppingBagPriceProps) => {
  const t = useTranslations("common");
  const formatter = useLocalizedFormatter();

  const isPrimary = variant === "primary";

  // Мемоизация форматированной цены
  const formattedPrice = useMemo(() => {
    if (!price?.amount) {
      return null;
    }

    return price.amount === 0
      ? t("free")
      : formatter.price({ amount: price.amount });
  }, [price, formatter, t]);

  // Мемоизация форматированной скидки
  const formattedDiscount = useMemo(() => {
    if (!discount?.amount) {
      return null;
    }

    return `-${formatter.price({ amount: discount.amount })}`;
  }, [discount, formatter]);

  return (
    <>
      {isPrimary && <hr className="border-border/60" />}

      <div
        className={cn(
          "text-content text-foreground flex justify-between text-sm sm:text-base",
          {
            "[&>*]:text-base [&>*]:font-semibold sm:[&>*]:text-lg": isPrimary,
            "text-muted-foreground": !isPrimary,
          },
        )}
        data-testid={`shopping-bag-price-${dataTestId}`}
      >
        <p>{heading}</p>
        {formattedPrice && (
          <p className={cn(isPrimary && "text-primary")}>{formattedPrice}</p>
        )}
        {formattedDiscount && (
          <p className="text-primary font-medium">{formattedDiscount}</p>
        )}
      </div>
    </>
  );
};

// Мемоизация - используется в корзине и чекауте (Subtotal, Total, Discount)
export const ShoppingBagPrice = memo(
  ShoppingBagPriceComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.variant === nextProps.variant &&
      prevProps.heading === nextProps.heading &&
      prevProps.price?.amount === nextProps.price?.amount &&
      prevProps.discount?.amount === nextProps.discount?.amount &&
      prevProps.dataTestId === nextProps.dataTestId
    );
  },
);
