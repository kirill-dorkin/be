"use client";

import { Globe } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@nimara/ui/components/button";

import { useCurrentRegion } from "@/regions/client";

// Dynamically import modal to reduce initial bundle size
const LocaleSwitchModal = dynamic(() =>
  import("./locale-modal").then((mod) => ({ default: mod.LocaleSwitchModal })),
);

export const LocaleSwitch = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("locale");
  const region = useCurrentRegion();

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
        aria-label={t("region-settings")}
      >
        <Globe className="h-4 w-4" /> {region.market.id.toLocaleUpperCase()}
      </Button>
      {isMounted && (
        <LocaleSwitchModal
          open={isOpen}
          onClose={closeModal}
          onExited={() => setIsMounted(false)}
        />
      )}
    </>
  );
};

LocaleSwitch.displayName = "LocaleSwitch";
