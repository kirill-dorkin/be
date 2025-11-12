"use client";

import { memo, useCallback } from "react";

import { Button } from "@nimara/ui/components/button";
import { Label } from "@nimara/ui/components/label";
import { Spinner } from "@nimara/ui/components/spinner";

import { cn } from "@/lib/utils";
import type { Market, SupportedLocale } from "@/regions/types";

type ContinentRowProps = {
  currentLocale: SupportedLocale;
  markets: Market[];
  name: string;
  onLocaleSelect: (locale: SupportedLocale, label: string) => void;
  pendingLocale?: { label: string, locale: SupportedLocale; } | null;
};

const ContinentRowComponent = ({
  currentLocale,
  markets,
  name,
  onLocaleSelect,
  pendingLocale,
}: ContinentRowProps) => {
  // Мемоизация обработчика клика
  const handleClick = useCallback((market: Market) => {
    const locale = market.defaultLanguage.locale;

    if (locale === currentLocale) {
      return;
    }

    onLocaleSelect(locale, market.defaultLanguage.name);
  }, [currentLocale, onLocaleSelect]);

  return (
    <section>
      <Label className="border-bottom text-slate-700 dark:text-primary block border-b border-stone-200 pb-3 pt-4 text-lg font-semibold leading-6 md:pb-4 md:pt-6">
        {name}
      </Label>
      <div className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-2 md:grid-cols-3">
        {markets.map((market) => {
          const locale = market.defaultLanguage.locale;
          const isActive = locale === currentLocale;
          const isPending = pendingLocale?.locale === locale;

          return (
            <div key={market.id} className="flex">
              <Button
                variant="ghost"
                className={cn(
                  "border border-stone-200/60 text-muted-foreground flex h-auto w-full flex-col items-start rounded-2xl bg-white/95 p-4 text-left text-sm font-normal leading-5 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.45)] transition-colors",
                  {
                    "pointer-events-none opacity-50":
                      isActive || Boolean(pendingLocale),
                  },
                )}
                onClick={() => handleClick(market)}
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-base font-semibold text-foreground">
                      {locale.toUpperCase()}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {market.defaultLanguage.name}
                    </span>
                  </div>
                  {isPending && (
                    <Spinner size={16} className="text-foreground" />
                  )}
                </div>
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// Мемоизация - ряд с континентом в модальном окне локали
export const ContinentRow = memo(ContinentRowComponent, (prevProps, nextProps) => {
  return (
    prevProps.currentLocale === nextProps.currentLocale &&
    prevProps.name === nextProps.name &&
    prevProps.markets.length === nextProps.markets.length &&
    prevProps.pendingLocale?.locale === nextProps.pendingLocale?.locale
  );
});
ContinentRow.displayName = "ContinentRow";
