import { CHANNEL, LANGUAGES, LOCALE_CHANNEL_MAP, MARKETS } from "./config";
import {
  type ChannelId,
  isSupportedCurrency,
  type LanguageId,
  type MarketId,
  SUPPORTED_LOCALES,
  type SupportedCurrency,
  type SupportedLocale,
} from "./types";

function getMarketId(locale: SupportedLocale): MarketId {
  return LOCALE_CHANNEL_MAP[locale];
}

export function getLanguageId(locale: SupportedLocale): LanguageId {
  return LOCALE_CHANNEL_MAP[locale];
}

type ParseRegionOptions = {
  currency?: SupportedCurrency;
};

export const parseRegion = (
  locale: string,
  options?: ParseRegionOptions,
) => {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(`Locale ${locale} is not supported`);
  }

  const marketId = getMarketId(locale);
  const languageId = getLanguageId(locale);
  const currencyOverride = options?.currency;

  const baseMarket = MARKETS[marketId.toUpperCase() as Uppercase<MarketId>];
  const language = LANGUAGES[languageId.toUpperCase() as Uppercase<LanguageId>];

  const market = {
    ...baseMarket,
    currency: isSupportedCurrency(currencyOverride)
      ? currencyOverride
      : baseMarket.currency,
    channel: baseMarket.channel as ChannelId,
  };

  return Object.freeze({
    market,
    language,
  });
};
