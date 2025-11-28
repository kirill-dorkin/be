"use client";

import { Crown, Tag, TrendingDown } from "lucide-react";
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
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/60 px-4 py-3 shadow-sm dark:border-amber-800/60 dark:bg-amber-900/20",
          className,
        )}
      >
        <Badge className="bg-amber-500/90 text-white shadow-sm">
          <Crown className="mr-1 h-3 w-3" />
          {t("membership.member-price")}
        </Badge>
        <span className={cn("font-bold text-foreground", sizeClasses[size])}>
          {formattedMemberPrice}
        </span>
      </div>
    );
  }

  // Для гостей показываем сравнение
  return (
    <div
      className={cn(
        "flex gap-4 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-4 shadow-sm dark:border-amber-800/60 dark:from-amber-950/20 dark:via-slate-900 dark:to-yellow-950/10",
        orientation === "vertical"
          ? "flex-col"
          : "flex-col sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      role="group"
      aria-label={t("membership.member-price")}
    >
      <div className="flex-1 space-y-2">
        {/* Обычная цена */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Tag className="h-4 w-4" />
          <div className="flex flex-col leading-tight">
            <span className="text-xs uppercase tracking-wide">
              {t("membership.regular-price")}
            </span>
            <span
              className={cn(
                "font-semibold text-foreground break-words",
                sizeClasses[size],
              )}
            >
              {formattedRegularPrice}
            </span>
          </div>
        </div>

        {/* Цена для членов */}
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-600" />
          <div className="flex flex-col leading-tight">
            <span className="text-xs uppercase tracking-wide text-amber-700">
              {t("membership.member-price")}
            </span>
            <span
              className={cn(
                "font-bold text-amber-700 break-words",
                sizeClasses[size],
              )}
            >
              {formattedMemberPrice}
            </span>
          </div>
        </div>

        {/* Экономия */}
        <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-1.5 shadow-[inset_0_0_0_1px_rgba(34,197,94,0.12)] dark:bg-green-900/20">
          <TrendingDown className="h-4 w-4 text-green-600" />
          <span className="text-xs font-semibold text-green-700 dark:text-green-400">
            {t("membership.save", { amount: formattedSavings, percent: savingsPercent })}
          </span>
        </div>
      </div>

      {/* Призыв к действию */}
      {showCTA && (
        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <Button
            asChild
            size="sm"
            className="w-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 shadow-sm hover:from-amber-600 hover:to-yellow-700"
          >
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
