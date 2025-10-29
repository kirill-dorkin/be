import { headers } from "next/headers";
import { getLocale } from "next-intl/server";

import { localePrefixes } from "@/i18n/routing";
import { DEFAULT_LOCALE, type SupportedLocale } from "@/regions/types";

const resolveBaseUrl = async () => {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const fallbackProto = host?.includes("localhost") ? "http" : "https";
  const proto = forwardedProto ?? fallbackProto;

  const envUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL?.trim();

  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  if (host) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  throw new Error("Unable to resolve storefront base URL. Set NEXT_PUBLIC_STOREFRONT_URL.");
};

export const getStoreUrl = async () => {
  const locale = await getLocale();
  const baseUrl = await resolveBaseUrl();

  if (locale === DEFAULT_LOCALE) {
    return baseUrl;
  }

  const prefix = localePrefixes[
    locale as Exclude<SupportedLocale, typeof DEFAULT_LOCALE>
  ];

  return `${baseUrl}${prefix}`;
};

export const getLocalePrefix = async (): Promise<string> => {
  const locale = await getLocale();

  if (locale === DEFAULT_LOCALE) {
    return "";
  }

  return localePrefixes[
    locale as Exclude<SupportedLocale, typeof DEFAULT_LOCALE>
  ];
};

// builds a full URL by joining a relative path to the store base URL avoiding incorrect slash handling.
export const getStoreUrlWithPath = (base: string, path: string): string => {
  const normalizedBase = base.replace(/\/$/, "") + "/";
  const normalizedPath = path.replace(/^\//, "");

  return new URL(normalizedPath, normalizedBase).toString();
};
