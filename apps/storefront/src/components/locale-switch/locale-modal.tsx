"use client";

import { X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";

import { Button } from "@nimara/ui/components/button";
import { Label } from "@nimara/ui/components/label";
import { Spinner } from "@nimara/ui/components/spinner";

import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useCurrentRegion } from "@/regions/client";
import { useRegionContext } from "@/regions/client/region-provider";
import { MARKETS } from "@/regions/config";
import type { MarketId, SupportedLocale } from "@/regions/types";

import { ContinentRow } from "./continent-row";

type LocaleSwitchModalProps = {
  onClose: () => void;
  onExited: () => void;
  open: boolean;
};

export function LocaleSwitchModal({
  onClose,
  onExited,
  open,
}: LocaleSwitchModalProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const region = useCurrentRegion();
  const { setLocale } = useRegionContext();

  const [isPending, startTransition] = useTransition();
  const [pendingLocale, setPendingLocale] = useState<
    { label: string, locale: SupportedLocale; } | null
  >(null);

  const markets = useMemo(() => Object.values(MARKETS), []);
  const defaultMarket = region.market.id.toUpperCase() as Uppercase<MarketId>;
  const currentLocale = MARKETS[defaultMarket].defaultLanguage.locale;

  const marketsByContinent = useMemo(
    () => ({
      asia_pacific: markets.filter(
        (market) => market.continent === "Asia Pacific",
      ),
      europe: markets.filter((market) => market.continent === "Europe"),
      north_america: markets.filter(
        (market) => market.continent === "North America",
      ),
    }),
    [markets],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const basePath = pathname ?? "/";
    const search = searchParams.toString();
    const target = search ? `${basePath}?${search}` : basePath;

    markets.forEach((market) => {
      void router.prefetch(target, {
        locale: market.defaultLanguage.locale,
      });
    });
  }, [markets, open, pathname, router, searchParams]);

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

  useEffect(() => {
    if (!isPending && pendingLocale) {
      onClose();
    }
  }, [isPending, onClose, pendingLocale]);

  const handleLocaleSelect = (locale: SupportedLocale, label: string) => {
    if (locale === currentLocale || isPending) {
      return;
    }

    setPendingLocale({ locale, label });

    startTransition(() => {
      setLocale(locale);

      const basePath = pathname ?? "/";
      const search = searchParams.toString();
      const target = search ? `${basePath}?${search}` : basePath;

      void router.replace(target, { locale });
    });
  };

  useEffect(() => {
    if (!open) {
      setPendingLocale(null);
    }
  }, [open]);

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
          open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        )}
      >
        <div className="flex items-center justify-between">
          <Label className="text-slate-700 dark:text-primary text-lg font-semibold leading-7">
            {t("locale.region-settings")}
          </Label>
          <Button variant="ghost" onClick={onClose} size="icon">
            <X className="size-4" />
          </Button>
        </div>

        {!!marketsByContinent.asia_pacific.length && (
          <ContinentRow
            currentLocale={currentLocale}
            markets={marketsByContinent.asia_pacific}
            name={t("locale.continents.asia-pacific")}
            onLocaleSelect={handleLocaleSelect}
            pendingLocale={pendingLocale}
          />
        )}
        {!!marketsByContinent.europe.length && (
          <ContinentRow
            currentLocale={currentLocale}
            markets={marketsByContinent.europe}
            name={t("locale.continents.europe")}
            onLocaleSelect={handleLocaleSelect}
            pendingLocale={pendingLocale}
          />
        )}
        {!!marketsByContinent.north_america.length && (
          <ContinentRow
            currentLocale={currentLocale}
            markets={marketsByContinent.north_america}
            name={t("locale.continents.north-america")}
            onLocaleSelect={handleLocaleSelect}
            pendingLocale={pendingLocale}
          />
        )}

        {pendingLocale && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-background/85">
            <div className="flex w-full max-w-sm flex-col items-center gap-3 px-6 text-center">
              <Spinner size={24} className="text-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                {SWITCH_MESSAGES[pendingLocale.locale].replace(
                  "{language}",
                  pendingLocale.label,
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

LocaleSwitchModal.displayName = "LocaleSwitchModal";
const SWITCH_MESSAGES: Record<SupportedLocale, string> = {
  "en-US": "Switching language to {language}",
  "en-GB": "Switching language to {language}",
  "ru-RU": "Переключаем язык на {language}",
  "ky-KG": "Тилди {language} кылып өзгөртүп жатабыз",
};
