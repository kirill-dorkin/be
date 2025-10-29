"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";

import { Button } from "@nimara/ui/components/button";
import { Label } from "@nimara/ui/components/label";

import { getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useRegionContext } from "@/regions/client/region-provider";
import { MARKETS } from "@/regions/config";
import type { SupportedCurrency } from "@/regions/types";

type CurrencySwitchModalProps = {
  currentCurrency: string;
  onClose: () => void;
  onExited: () => void;
  open: boolean;
};

type CurrencyOption = {
  currency: SupportedCurrency;
  id: (typeof MARKETS)[keyof typeof MARKETS]["id"];
  languageName: (typeof MARKETS)[keyof typeof MARKETS]["defaultLanguage"]["name"];
  marketName: (typeof MARKETS)[keyof typeof MARKETS]["name"];
};

const getCurrencyOptions = (): CurrencyOption[] =>
  Object.values(MARKETS).map((market) => ({
    currency: market.currency,
    id: market.id,
    languageName: market.defaultLanguage.name,
    marketName: market.name,
  }));

export function CurrencySwitchModal({
  currentCurrency,
  onClose,
  onExited,
  open,
}: CurrencySwitchModalProps) {
  const t = useTranslations("currency");
  const [isPending, startTransition] = useTransition();
  const { setCurrency } = useRegionContext();

  const currencyOptions = getCurrencyOptions();

  const onCurrencyClick = (currency: SupportedCurrency) => {
    onClose();

    startTransition(() => {
      setCurrency(currency);
    });
  };

  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    if (!open) {
      const timeout = window.setTimeout(() => {
        onExited();
      }, 280);

      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [open, onExited]);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 md:py-20">
      <div
        className={cn(
          "absolute inset-0 bg-stone-950/40 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-[61] mx-auto flex w-full max-w-[620px] flex-col gap-4 rounded-3xl bg-background px-5 pb-6 pt-5 shadow-[0_32px_120px_-60px_rgba(15,23,42,0.45)] transition-all duration-300 ease-out md:max-w-[700px]",
          open
            ? "translate-y-0 opacity-100"
            : "translate-y-6 opacity-0",
        )}
      >
        <div className="flex items-center justify-between">
          <Label className="text-slate-700 dark:text-primary text-lg font-semibold leading-7">
            {t("currency-settings")}
          </Label>
          <Button variant="ghost" onClick={onClose} size="icon">
            <X className="size-4" />
          </Button>
        </div>

        <Label className="text-muted-foreground mb-2 block text-sm font-medium uppercase tracking-wider">
          {t("available-currencies")}
        </Label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {currencyOptions.map((option) => {
            const isActive = option.currency === currentCurrency;
            const isSom = option.currency === "KGS";
            const symbol = isSom ? null : getCurrencySymbol(option.currency);

            const symbolClassName = cn(
              "flex h-10 w-10 items-center justify-center rounded-full border border-border text-base font-semibold leading-none text-foreground",
              symbol === "с" && "text-[1.45rem] -translate-y-[1px]",
            );

            return (
              <Button
                key={option.id}
                variant="ghost"
                className={cn(
                  "text-muted-foreground flex h-auto w-full flex-col items-start gap-3 rounded-2xl p-4 text-left text-sm font-normal leading-5 transition-colors",
                )}
                disabled={isPending || isActive}
                onClick={() => onCurrencyClick(option.currency)}
              >
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className={symbolClassName}>
                    {symbol}
                  </span>
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {option.marketName}
                    </span>
                    <span className="text-base font-semibold text-foreground">
                      {option.currency}
                    </span>
                  </div>
                </div>
                <span className="text-muted-foreground text-sm">
                  {option.languageName}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}

CurrencySwitchModal.displayName = "CurrencySwitchModal";
