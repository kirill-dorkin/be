"use client";

import { memo, useMemo } from "react";

import { type Price } from "@nimara/domain/objects/common";

import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";
import { cn } from "@/lib/utils";

const HeaderComponent = ({
  header = "Your Bag",
  totalPrice,
}: {
  header?: string;
  totalPrice?: Price;
}) => {
  const formatter = useLocalizedFormatter();

  const headerTextClass = "text-xl sm:text-2xl font-semibold text-foreground";

  // Мемоизация форматированной цены
  const formattedPrice = useMemo(
    () => totalPrice ? formatter.price({ amount: totalPrice.amount }) : null,
    [totalPrice, formatter]
  );

  return (
    <div
      className={cn("flex items-center justify-between border-b border-border/60 pb-4", {
        "justify-start gap-2 md:justify-between": totalPrice,
      })}
    >
      <h1 className={headerTextClass}>{header}</h1>
      {totalPrice && (
        <p className={cn("text-muted-foreground", "block md:hidden")}>•</p>
      )}
      {totalPrice && (
        <p className={cn(headerTextClass, "text-primary")}>
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
