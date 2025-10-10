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

  const isSom = region.market.currency === "KGS";
  const currencySymbol = isSom
    ? null
    : getCurrencySymbol(region.market.currency);
  const symbolClassName = cn(
    "text-lg font-semibold leading-none",
    currencySymbol === "с" && "text-xl",
  );

  return (
    <>
      <Button
        variant="ghost"
        size="default"
        className="gap-1.5"
        onClick={() => setShowModal(true)}
        aria-label={t("currency-settings")}
      >
        {!isSom && currencySymbol && (
          <span aria-hidden="true" className={symbolClassName}>
            {currencySymbol}
          </span>
        )}
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
