"use client";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

import type { TaxedPrice } from "@nimara/domain/objects/common";

import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";

type Props = {
  className?: string;
  hasFreeVariants?: boolean;
  price?: TaxedPrice;
  size?: "default" | "small";
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
  size = "default",
  startPrice,
  undiscountedPrice,
}: Props) => {
  const t = useTranslations();
  const formatter = useLocalizedFormatter();

  // Мемоизация discount info для предотвращения лишних вычислений
  const discountInfo = useMemo(
    () => getDiscountInfo(price, undiscountedPrice),
    [price, undiscountedPrice],
  );

  const renderPrice = (priceToFormat?: TaxedPrice) => {
    if (!priceToFormat || priceToFormat.amount === 0) {
      return t("common.free");
    }

    return formatter.price({ amount: priceToFormat.amount });
  };

  // Size classes
  const sizeClasses =
    size === "small"
      ? {
          free: "text-lg",
          price: "text-base md:text-lg lg:text-xl",
          oldPrice: "mr-2 text-xs md:mr-3 md:text-sm",
        }
      : {
          free: "text-3xl",
          price: "text-2xl md:text-3xl lg:text-4xl",
          oldPrice: "mr-2 text-base md:mr-3 md:text-lg",
        };

  // A specific variant is selected (price is defined).
  if (price) {
    if (price.amount === 0) {
      return (
        <span className={`${sizeClasses.free} font-bold ${className}`}>
          {t("common.free")}
        </span>
      );
    }

    const { hasDiscount, oldPrice } = discountInfo;

    return (
      <span className={className}>
        {hasDiscount && oldPrice && (
          <span
            className={`${sizeClasses.oldPrice} text-gray-500 line-through dark:text-gray-400`}
          >
            {renderPrice(oldPrice)}
          </span>
        )}
        <span className={`${sizeClasses.price} font-bold`}>
          {renderPrice(price)}
        </span>
      </span>
    );
  }

  // No specific variant is selected.
  if (hasFreeVariants) {
    return (
      <span className={`${sizeClasses.price} font-bold ${className}`}>
        {t("common.free")}
      </span>
    );
  }

  //  No free variants.
  if (startPrice) {
    return (
      <span className={`${sizeClasses.price} font-bold ${className}`}>
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
    prevProps.undiscountedPrice?.amount ===
      nextProps.undiscountedPrice?.amount &&
    prevProps.startPrice?.amount === nextProps.startPrice?.amount &&
    prevProps.hasFreeVariants === nextProps.hasFreeVariants &&
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className
  );
});
