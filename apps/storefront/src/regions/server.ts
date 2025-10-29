"use server";

import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

import { COOKIE_KEY } from "@/config";
import { isSupportedCurrency, type Region } from "@/regions/types";

import { parseRegion } from "./utils";

export const getCurrentRegion = async (): Promise<Readonly<Region>> => {
  const locale = await getLocale();
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKIE_KEY.currency)?.value;
  const currencyCookie =
    typeof cookieValue === "string" ? cookieValue : undefined;
  const fallbackCurrency: Region["market"]["currency"] = "KGS";

  return parseRegion(locale, {
    currency: isSupportedCurrency(currencyCookie)
      ? currencyCookie
      : fallbackCurrency,
  });
};
