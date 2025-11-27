"use client";

import { Crown, TrendingDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@nimara/ui/components/badge";
import { Button } from "@nimara/ui/components/button";
import { cn } from "@nimara/ui/lib/utils";

import { LocalizedLink } from "@/i18n/routing";
import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";
import { paths } from "@/lib/paths";

interface PriceComparisonProps {
  /** Класс для кастомизации */
  className?: string;
  /** Является ли пользователь членом */
  isMember?: boolean;
  /** Цена для членов */
  memberPrice: number;
  /** Вертикальное или горизонтальное расположение */
  orientation?: "vertical" | "horizontal";
  /** Обычная цена */
  regularPrice: number;
  /** Показывать ли призыв к действию */
  showCTA?: boolean;
  /** Размер компонента */
  size?: "sm" | "md" | "lg";
}

export function PriceComparison({
  regularPrice,
  memberPrice,
  isMember = false,
  size = "md",
  showCTA = true,
  orientation = "vertical",
  className,
}: PriceComparisonProps) {
  const t = useTranslations();
  const formatter = useLocalizedFormatter();

  const savings = regularPrice - memberPrice;
  const savingsPercent = Math.round((savings / regularPrice) * 100);

  const formattedRegularPrice = formatter.price({ amount: regularPrice });
  const formattedMemberPrice = formatter.price({ amount: memberPrice });
  const formattedSavings = formatter.price({ amount: savings });

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (isMember) {
    // Для членов показываем только их цену с бейджем
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-baseline gap-2">
          <span className={cn("font-bold text-primary", sizeClasses[size])}>
            {formattedMemberPrice}
          </span>
          <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0">
            <Crown className="mr-1 h-3 w-3" />
            {t("membership.member-price")}
          </Badge>
        </div>
      </div>
    );
  }

  // Для гостей показываем сравнение
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-3 dark:border-amber-800 dark:from-amber-950/30 dark:to-yellow-950/30",
        orientation === "vertical" ? "flex-col" : "flex-row items-center justify-between",
        className
      )}
    >
      <div className="flex-1 space-y-2">
        {/* Обычная цена */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t("membership.regular-price")}:
          </span>
          <span className={cn("font-semibold text-foreground", sizeClasses[size])}>
            {formattedRegularPrice}
          </span>
        </div>

        {/* Цена для членов */}
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium">{t("membership.member-price")}:</span>
          <span className={cn("font-bold text-amber-600", sizeClasses[size])}>
            {formattedMemberPrice}
          </span>
        </div>

        {/* Экономия */}
        <div className="flex items-center gap-2 rounded-md bg-green-100 px-2 py-1 dark:bg-green-900/30">
          <TrendingDown className="h-4 w-4 text-green-600" />
          <span className="text-xs font-semibold text-green-700 dark:text-green-400">
            {t("membership.save", { amount: formattedSavings, percent: savingsPercent })}
          </span>
        </div>
      </div>

      {/* Призыв к действию */}
      {showCTA && (
        <div className="flex flex-col gap-2">
          <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700">
            <LocalizedLink href={paths.membership.asPath()}>
              <Crown className="mr-2 h-4 w-4" />
              {t("membership.join-now")}
            </LocalizedLink>
          </Button>
          <span className="text-center text-xs text-muted-foreground">
            {t("membership.price-per-month", { price: "199 ₸" })}
          </span>
        </div>
      )}
    </div>
  );
}
