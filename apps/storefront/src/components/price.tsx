"use client";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

import type { TaxedPrice } from "@nimara/domain/objects/common";

import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";

type Props = {
  className?: string;
  hasFreeVariants?: boolean;
  price?: TaxedPrice;
  startPrice?: TaxedPrice;
  undiscountedPrice?: TaxedPrice;
};

export const getDiscountInfo = (
  price?: TaxedPrice,
  undiscountedPrice?: TaxedPrice,
) => {
  const hasDiscount =
    price != null &&
    undiscountedPrice != null &&
    undiscountedPrice.amount > price.amount;

  const discountPercent = hasDiscount
    ? Math.round(
        ((undiscountedPrice.amount - price.amount) / undiscountedPrice.amount) *
          100,
      )
    : 0;

  return {
    hasDiscount,
    discountPercent,
    finalPrice: price,
    oldPrice: hasDiscount ? undiscountedPrice : null,
  };
};

const PriceComponent = ({
  className,
  hasFreeVariants,
  price,
  startPrice,
  undiscountedPrice,
}: Props) => {
  const t = useTranslations();
  const formatter = useLocalizedFormatter();

  // Мемоизация discount info для предотвращения лишних вычислений
  const discountInfo = useMemo(
    () => getDiscountInfo(price, undiscountedPrice),
    [price, undiscountedPrice]
  );

  const renderPrice = (priceToFormat?: TaxedPrice) => {
    if (!priceToFormat || priceToFormat.amount === 0) {
      return t("common.free");
    }

    return formatter.price({ amount: priceToFormat.amount });
  };

  // A specific variant is selected (price is defined).
  if (price) {
    if (price.amount === 0) {
      return (
        <span className={`text-lg font-bold ${className}`}>
          {t("common.free")}
        </span>
      );
    }

    const { hasDiscount, oldPrice } = discountInfo;

    return (
      <span className={className}>
        {hasDiscount && oldPrice && (
          <span className="mr-2 text-xs text-gray-500 line-through md:mr-3 md:text-sm dark:text-gray-400">
            {renderPrice(oldPrice)}
          </span>
        )}
        <span className="text-base font-bold md:text-lg lg:text-xl">{renderPrice(price)}</span>
      </span>
    );
  }

  // No specific variant is selected.
  if (hasFreeVariants) {
    return (
      <span className={`text-base font-bold md:text-lg lg:text-xl ${className}`}>
        {t("common.free")}
      </span>
    );
  }

  //  No free variants.
  if (startPrice) {
    return (
      <span className={`text-base font-bold md:text-lg lg:text-xl ${className}`}>
        {startPrice.amount === 0
          ? t("common.free")
          : t("common.from-price", { price: renderPrice(startPrice) })}
      </span>
    );
  }

  return null;
};

// Мемоизация Price компонента для оптимизации ре-рендеров
export const Price = memo(PriceComponent, (prevProps, nextProps) => {
  return (
    prevProps.price?.amount === nextProps.price?.amount &&
    prevProps.undiscountedPrice?.amount === nextProps.undiscountedPrice?.amount &&
    prevProps.startPrice?.amount === nextProps.startPrice?.amount &&
    prevProps.hasFreeVariants === nextProps.hasFreeVariants &&
    prevProps.className === nextProps.className
  );
});
