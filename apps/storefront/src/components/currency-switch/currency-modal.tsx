"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";

import { Button } from "@nimara/ui/components/button";

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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 px-4 pb-8 pt-24 backdrop-blur-sm sm:items-center sm:pt-0">
      <div
        className={cn(
          "relative z-[61] w-full max-w-[520px] rounded-[32px] bg-white px-6 pb-8 pt-6 text-slate-900 shadow-[0_40px_120px_rgba(15,23,42,0.35)] transition-all duration-300 ease-out dark:bg-stone-900",
          open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold leading-tight">{t("currency-settings")}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{t("available-currencies")}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-muted/40 hover:bg-muted"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6 space-y-2">
          {currencyOptions.map((option) => {
            const isActive = option.currency === currentCurrency;
            const isSom = option.currency === "KGS";
            const symbol = isSom ? null : getCurrencySymbol(option.currency);

            return (
              <button
                type="button"
                key={option.id}
                className={cn(
                  "w-full rounded-3xl border border-transparent bg-muted/50 p-4 text-left transition-all duration-200",
                  "hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  isActive &&
                    "bg-primary/10 border-primary/40 shadow-[0_8px_32px_rgba(80,63,205,0.15)] dark:bg-primary/20",
                )}
                disabled={isPending || isActive}
                onClick={() => onCurrencyClick(option.currency)}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border text-base font-semibold leading-none",
                      isActive
                        ? "border-primary bg-white text-primary dark:bg-primary-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {symbol ?? option.currency.charAt(0)}
                  </span>
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {option.marketName}
                    </span>
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      {option.currency}
                    </span>
                    <span className="text-sm text-muted-foreground">{option.languageName}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}

CurrencySwitchModal.displayName = "CurrencySwitchModal";
