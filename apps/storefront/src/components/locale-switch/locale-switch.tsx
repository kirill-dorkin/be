"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { lazy, memo, Suspense, useCallback, useState } from "react";

import { Button } from "@nimara/ui/components/button";

import { useCurrentRegion } from "@/regions/client";

// Lazy loading модального окна для уменьшения initial bundle size
const LocaleSwitchModal = lazy(() => import("./locale-modal").then((mod) => ({ default: mod.LocaleSwitchModal })));

const LocaleSwitchComponent = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("locale");
  const region = useCurrentRegion();

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
        aria-label={t("region-settings")}
      >
        <Globe className="h-4 w-4" /> {region.market.id.toLocaleUpperCase()}
      </Button>
      {isMounted && (
        <Suspense fallback={null}>
          <LocaleSwitchModal
            open={isOpen}
            onClose={closeModal}
            onExited={() => setIsMounted(false)}
          />
        </Suspense>
      )}
    </>
  );
};

// Мемоизация - переключатель локали в header
export const LocaleSwitch = memo(LocaleSwitchComponent);
LocaleSwitch.displayName = "LocaleSwitch";
