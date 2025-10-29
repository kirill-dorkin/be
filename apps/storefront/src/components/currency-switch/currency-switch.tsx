"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@nimara/ui/components/button";

import { getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useCurrentRegion } from "@/regions/client";

import { CurrencySwitchModal } from "./currency-modal";

export const CurrencySwitch = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("currency");
  const region = useCurrentRegion();

  const isSom = region.market.currency === "KGS";
  const currencySymbol = isSom
    ? null
    : getCurrencySymbol(region.market.currency);
  const symbolClassName = cn(
    "text-xl font-bold leading-none",
    currencySymbol === "с" && "text-[1.55rem]",
  );

  const openModal = () => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => setIsOpen(true));
    } else {
      setIsOpen(true);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
  };

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
        <CurrencySwitchModal
          currentCurrency={region.market.currency}
          onClose={closeModal}
          open={isOpen}
          onExited={() => setIsMounted(false)}
        />
      )}
    </>
  );
};

CurrencySwitch.displayName = "CurrencySwitch";
