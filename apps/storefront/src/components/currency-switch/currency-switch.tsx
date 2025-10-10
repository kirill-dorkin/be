"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@nimara/ui/components/button";

import { getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useCurrentRegion } from "@/regions/client";

import { CurrencySwitchModal } from "./currency-modal";

export const CurrencySwitch = () => {
  const [showModal, setShowModal] = useState(false);
  const t = useTranslations("currency");
  const region = useCurrentRegion();

  const currencySymbol = getCurrencySymbol(region.market.currency);
  const symbolClassName = cn(
    "flex h-8 w-8 items-center justify-center rounded-full border border-border text-lg font-semibold leading-none",
    currencySymbol === "с" && "text-[1.3rem] -translate-y-[2px] [line-height:1]",
  );

  return (
    <>
      <Button
        variant="ghost"
        size="default"
        className="gap-2"
        onClick={() => setShowModal(true)}
        aria-label={t("currency-settings")}
      >
        <span aria-hidden="true" className={symbolClassName}>
          {currencySymbol}
        </span>
        {region.market.currency}
      </Button>
      {showModal && (
        <CurrencySwitchModal
          currentCurrency={region.market.currency}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

CurrencySwitch.displayName = "CurrencySwitch";
