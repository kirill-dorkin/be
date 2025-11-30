"use client";

import { Tag } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@nimara/ui/lib/utils";

import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";

interface PriceComparisonProps {
  /** Класс для кастомизации */
  className?: string;
  /** Обычная цена */
  regularPrice: number;
  /** Размер компонента */
  size?: "sm" | "md" | "lg";
}

export function PriceComparison({
  regularPrice,
  size = "md",
  className,
}: PriceComparisonProps) {
  const t = useTranslations();
  const formatter = useLocalizedFormatter();

  const formattedRegularPrice = formatter.price({ amount: regularPrice });

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={cn(
        "bg-card/40 flex flex-col gap-1 rounded-lg sm:flex-row sm:items-center sm:gap-3",
        className,
      )}
      role="group"
      aria-label={t("membership.regular-price")}
    >
      <div className="text-muted-foreground flex items-center gap-2 sm:min-w-[140px]">
        <Tag className="h-4 w-4 flex-shrink-0" />
        <span className="text-[11px] uppercase leading-tight tracking-wide">
          {t("membership.regular-price")}
        </span>
      </div>
      <div
        className={cn(
          "text-foreground text-2xl font-semibold leading-tight sm:text-3xl",
          sizeClasses[size],
        )}
      >
        {formattedRegularPrice}
      </div>
    </div>
  );
}
