"use client";

import { Crown, Tag } from "lucide-react";
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

  const formattedRegularPrice = formatter.price({ amount: regularPrice });
  const formattedMemberPrice = formatter.price({ amount: memberPrice });

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (isMember) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-muted/40 px-4 py-3 shadow-sm",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Badge className="bg-primary text-primary-foreground shadow-sm">
            <Crown className="mr-1 h-3 w-3" />
            {t("membership.member-price")}
          </Badge>
          <span className={cn("font-semibold text-foreground", sizeClasses[size])}>
            {formattedMemberPrice}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{t("membership.member-active")}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        orientation === "vertical"
          ? "flex-col"
          : "flex-col sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      role="group"
      aria-label={t("membership.member-price")}
    >
      <div className="flex-1 space-y-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-wide">
              {t("membership.regular-price")}
            </span>
          </div>
          <div className={cn("text-foreground font-semibold text-2xl leading-tight", sizeClasses[size])}>
            {formattedRegularPrice}
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Crown className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-wide">
              {t("membership.member-price")}
            </span>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-2 text-primary font-semibold",
              sizeClasses[size],
            )}
          >
            {formattedMemberPrice}
          </div>
        </div>
      </div>

      {showCTA && (
        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="w-full rounded-full border-border text-foreground hover:bg-muted"
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
