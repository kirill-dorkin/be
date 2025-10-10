"use client";


import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import type {
  Region,
  SupportedCurrency,
  SupportedLocale,
} from "@/regions/types";
import { parseRegion } from "@/regions/utils";

type RegionContextValue = {
  region: Readonly<Region>;
  setCurrency: (currency: SupportedCurrency) => void;
  setLocale: (locale: SupportedLocale) => void;
};

const RegionContext = createContext<RegionContextValue | null>(null);

type RegionProviderProps = PropsWithChildren<{
  initialRegion: Readonly<Region>;
}>;

export const RegionProvider = ({
  children,
  initialRegion,
}: RegionProviderProps) => {
  const [region, setRegion] = useState<Readonly<Region>>(initialRegion);

  const setCurrency = useCallback((currency: SupportedCurrency) => {
    setRegion((current) => {
      if (current.market.currency === currency) {
        return current;
      }

      return parseRegion(current.language.locale, { currency });
    });

    const encodedCurrency = encodeURIComponent(currency);

    document.cookie = [
      `${COOKIE_KEY.currency}=${encodedCurrency}`,
      "path=/",
      `max-age=${COOKIE_MAX_AGE.locale}`,
      "sameSite=Lax",
    ].join("; ");
  }, []);

  const setLocale = useCallback((nextLocale: SupportedLocale) => {
    setRegion((current) => {
      if (current.language.locale === nextLocale) {
        return current;
      }

      return parseRegion(nextLocale, { currency: current.market.currency });
    });

    const encodedLocale = encodeURIComponent(nextLocale);

    document.cookie = [
      `${COOKIE_KEY.locale}=${encodedLocale}`,
      "path=/",
      `max-age=${COOKIE_MAX_AGE.locale}`,
      "sameSite=Lax",
    ].join("; ");

    document.cookie = [
      `${COOKIE_KEY.checkoutId}=`,
      "path=/",
      "max-age=0",
      "sameSite=Lax",
    ].join("; ");
  }, []);

  const value = useMemo(
    () => ({
      region,
      setCurrency,
      setLocale,
    }),
    [region, setCurrency, setLocale],
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
};

export const useRegionContext = () => {
  const context = useContext(RegionContext);

  if (!context) {
    throw new Error("useRegionContext must be used within RegionProvider");
  }

  return context;
};
