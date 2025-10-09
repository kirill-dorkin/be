import { clientEnvs } from "@/envs/client";
import type {
  Language,
  LanguageId,
  Market,
  MarketId,
  SUPPORTED_MARKETS,
  SupportedLocale,
} from "@/regions/types";

export const CHANNEL = clientEnvs.NEXT_PUBLIC_DEFAULT_CHANNEL;

export const LOCALE_CHANNEL_MAP: Record<
  SupportedLocale,
  (typeof SUPPORTED_MARKETS)[number]
> = {
  "en-GB": "gb",
  "en-US": "us",
  "ru-RU": "ru",
  "ky-KG": "kg",
};

export const LANGUAGES = {
  GB: {
    id: "gb",
    name: "English (United Kingdom)",
    code: "EN_GB",
    locale: "en-GB",
  },
  US: {
    id: "us",
    name: "English (United States)",
    code: "EN_US",
    locale: "en-US",
  },
  RU: {
    id: "ru",
    name: "Русский (Россия)",
    code: "RU_RU",
    locale: "ru-RU",
  },
  KG: {
    id: "kg",
    name: "Кыргызча (Кыргызстан)",
    code: "KY_KG",
    locale: "ky-KG",
  },
} satisfies Record<Uppercase<LanguageId>, Language>;

export const MARKETS = {
  GB: {
    id: "gb",
    name: "United Kingdom",
    channel: CHANNEL,
    currency: "GBP",
    continent: "Europe",
    countryCode: "GB",
    defaultLanguage: LANGUAGES.GB,
    supportedLanguages: [LANGUAGES.GB],
  },
  US: {
    id: "us",
    name: "United States of America",
    channel: CHANNEL,
    currency: "USD",
    continent: "North America",
    countryCode: "US",
    defaultLanguage: LANGUAGES.US,
    supportedLanguages: [LANGUAGES.US],
  },
  RU: {
    id: "ru",
    name: "Russia",
    channel: CHANNEL,
    currency: "RUB",
    continent: "Europe",
    countryCode: "RU",
    defaultLanguage: LANGUAGES.RU,
    supportedLanguages: [LANGUAGES.RU],
  },
  KG: {
    id: "kg",
    name: "Kyrgyzstan",
    channel: CHANNEL,
    currency: "KGS",
    continent: "Asia Pacific",
    countryCode: "KG",
    defaultLanguage: LANGUAGES.KG,
    supportedLanguages: [LANGUAGES.KG],
  },
} satisfies Record<Uppercase<MarketId>, Market>;
