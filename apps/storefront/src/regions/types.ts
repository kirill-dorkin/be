// FIXME: Move the LanguageCodeEnum values to a domain file and import it from there
// eslint-disable-next-line no-restricted-imports
import { type LanguageCodeEnum } from "@nimara/codegen/schema";
import {
  type AllCountryCode,
  type AllCurrency,
  type AllLocale,
} from "@nimara/domain/consts";

/**
 * Defines available languages in the App.
 */
export const SUPPORTED_LANGUAGES = ["us", "gb", "ru", "kg"] as const;
export type LanguageId = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Defines supported locales in the App.
 */
export const SUPPORTED_LOCALES = [
  "en-GB",
  "en-US",
  "ru-RU",
  "ky-KG",
] as const satisfies AllLocale[];
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE = "ru-RU" as const satisfies AllLocale;

/**
 * Defines available markets in the App.
 */
export const SUPPORTED_MARKETS = ["gb", "us", "ru", "kg"] as const;
export type MarketId = (typeof SUPPORTED_MARKETS)[number];

/**
 * Defines supported currencies in the App.
 */
export const SUPPORTED_CURRENCIES = [
  "USD",
  "GBP",
  "RUB",
  "KGS",
] as const satisfies AllCurrency[];
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const isSupportedCurrency = (
  currency: string | null | undefined,
): currency is SupportedCurrency =>
  typeof currency === "string" &&
  SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency);

/**
 * Defines available channels in your Saleor instance.
 */
export const SUPPORTED_CHANNELS = [
  "default-channel",
  "channel-us",
  "channel-uk",
  "channel-ru",
  "channel-kg",
] as const;
export type ChannelId = (typeof SUPPORTED_CHANNELS)[number];

export type Market = {
  channel: ChannelId;
  continent: Continent;
  countryCode: AllCountryCode;
  currency: SupportedCurrency;
  defaultLanguage: Language;
  id: MarketId;
  name: string;
  supportedLanguages: Language[];
};

export type Language = {
  code: LanguageCodeEnum;
  id: LanguageId;
  locale: SupportedLocale;
  name: string;
};

export type Region = {
  language: Language;
  market: Market;
};

export type Continent = "Asia Pacific" | "Europe" | "North America";
