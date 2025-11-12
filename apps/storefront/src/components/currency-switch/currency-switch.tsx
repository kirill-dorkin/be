"use client";

import { useTranslations } from "next-intl";
import { lazy, memo, Suspense, useCallback, useMemo, useState } from "react";

import { Button } from "@nimara/ui/components/button";

import { getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useCurrentRegion } from "@/regions/client";

// Lazy loading модального окна для уменьшения initial bundle size
const CurrencySwitchModal = lazy(() => import("./currency-modal").then((mod) => ({ default: mod.CurrencySwitchModal })));

const CurrencySwitchComponent = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("currency");
  const region = useCurrentRegion();

  // Мемоизация флагов и значений
  const isSom = useMemo(() => region.market.currency === "KGS", [region.market.currency]);
  const currencySymbol = useMemo(
    () => isSom ? null : getCurrencySymbol(region.market.currency),
    [isSom, region.market.currency]
  );
  const symbolClassName = useMemo(
    () => cn(
      "text-xl font-bold leading-none",
      currencySymbol === "с" && "text-[1.55rem]",
    ),
    [currencySymbol]
  );

  // Мемоизация обработчиков
  const openModal = useCallback(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => setIsOpen(true));
    } else {
      setIsOpen(true);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="default"
        className="gap-1.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em]"
        onClick={openModal}
        aria-label={t("currency-settings")}
      >
        {!isSom && currencySymbol && (
          <span aria-hidden="true" className={symbolClassName}>
            {currencySymbol}
          </span>
        )}
        {region.market.currency}
      </Button>
      {isMounted && (
        <Suspense fallback={null}>
          <CurrencySwitchModal
            currentCurrency={region.market.currency}
            onClose={closeModal}
            open={isOpen}
            onExited={() => setIsMounted(false)}
          />
        </Suspense>
      )}
    </>
  );
};

// Мемоизация - переключатель валюты в header
export const CurrencySwitch = memo(CurrencySwitchComponent);
CurrencySwitch.displayName = "CurrencySwitch";
