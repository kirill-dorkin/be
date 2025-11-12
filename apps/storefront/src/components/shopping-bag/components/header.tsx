"use client";

import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

import { type Price } from "@nimara/domain/objects/common";

import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";
import { cn } from "@/lib/utils";

const HeaderComponent = ({
  header,
  totalPrice,
}: {
  header?: string;
  totalPrice?: Price;
}) => {
  const t = useTranslations();
  const formatter = useLocalizedFormatter();

  const headerTextClass = "text-2xl text-slate-700 dark:text-primary";

  // Мемоизация форматированной цены
  const formattedPrice = useMemo(
    () => totalPrice ? formatter.price({ amount: totalPrice.amount }) : null,
    [totalPrice, formatter]
  );

  return (
    <div
      className={cn("flex justify-between", {
        "justify-start gap-2 md:justify-between": totalPrice,
      })}
    >
      <h1 className={headerTextClass}>{header || t("cart.your-bag")}</h1>
      {totalPrice && (
        <p className={cn(headerTextClass, "block md:hidden")}>•</p>
      )}
      {totalPrice && (
        <p className={headerTextClass}>
          {formattedPrice}
        </p>
      )}
    </div>
  );
};

// Мемоизация - используется в корзине и чекауте
export const Header = memo(HeaderComponent, (prevProps, nextProps) => {
  return (
    prevProps.header === nextProps.header &&
    prevProps.totalPrice?.amount === nextProps.totalPrice?.amount
  );
});
