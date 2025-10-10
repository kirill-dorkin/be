import { type DateTimeFormatOptions } from "next-intl";

import { type AllCountryCode } from "@nimara/domain/consts";

import { convertFromUSD, getCurrencySymbol } from "@/lib/currency";
import { type WithRegion } from "@/lib/types";
import { type SupportedCurrency, type SupportedLocale } from "@/regions/types";

const numberFormatCache = new Map<string, Intl.NumberFormat>();

const getNumberFormatter = (
  locale: SupportedLocale,
  minDigits: number,
  maxDigits: number,
) => {
  const key = `${locale}-${minDigits}-${maxDigits}`;
  let formatter = numberFormatCache.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: Math.max(maxDigits, minDigits),
    });
    numberFormatCache.set(key, formatter);
  }

  return formatter;
};

export const localizedFormatter = ({ region }: WithRegion) => ({
  price: ({
    amount,
    currency,
    ...rest
  }: {
    amount?: number | null;
    currency?: SupportedCurrency;
    minimumFractionDigits?: number;
  }) => {
    const targetCurrency = currency ?? region.market.currency;
    const baseAmount = amount ?? 0;
    const amountInTarget =
      currency == null
        ? convertFromUSD(baseAmount, targetCurrency)
        : baseAmount;

    return formatAsPrice({
      ...rest,
      amount: amountInTarget,
      currency: targetCurrency,
      locale: region.language.locale,
    });
  },
  country: (opts: Omit<Parameters<typeof formatAsCountry>[0], "locale">) =>
    formatAsCountry({ locale: region.language.locale, ...opts }),
  date: (opts: Omit<Parameters<typeof formatAsDate>[0], "locale">) =>
    formatAsDate({ locale: region.language.locale, ...opts }),
});

export const formatAsPrice = ({
  locale,
  amount,
  currency,
  minimumFractionDigits,
}: {
  amount: number;
  currency: SupportedCurrency;
  locale: SupportedLocale;
  minimumFractionDigits?: number;
}) => {
  const normalizedAmount = Number.isFinite(amount) ? amount : 0;
  const hasCustomMinDigits = typeof minimumFractionDigits === "number";

  const resolveDigits = () => {
    if (currency === "KGS") {
      const hasFractionPart = Math.abs(normalizedAmount % 1) > 1e-6;
      const defaultMinDigits = hasFractionPart ? 2 : 0;
      const minDigits = hasCustomMinDigits
        ? Math.max(minimumFractionDigits ?? 0, 0)
        : defaultMinDigits;
      const maxDigits = hasCustomMinDigits
        ? Math.max(minDigits, defaultMinDigits)
        : hasFractionPart
          ? 2
          : 0;

      return { minDigits, maxDigits };
    }

    const defaultDigits = 2;
    const minDigits = hasCustomMinDigits
      ? Math.max(minimumFractionDigits ?? 0, 0)
      : defaultDigits;
    const maxDigits = hasCustomMinDigits
      ? Math.max(minDigits, defaultDigits)
      : minDigits;

    return { minDigits, maxDigits };
  };

  const { minDigits, maxDigits } = resolveDigits();

  const formatter = getNumberFormatter(locale, minDigits, maxDigits);
  const formattedAmount = formatter.format(normalizedAmount);
  const symbol = getCurrencySymbol(currency);

  if (currency === "RUB" || currency === "KGS") {
    return `${formattedAmount}\u00A0${symbol}`;
  }

  return `${symbol}${formattedAmount}`;
};

export const formatAsCountry = ({
  locale,
  country,
}: {
  country: AllCountryCode;
  locale: SupportedLocale;
}) => new Intl.DisplayNames(locale, { type: "region" }).of(country) as string;

export const formatAsDate = ({
  locale,
  date,
  options = { month: "long", year: "numeric", day: "2-digit" },
}: {
  date: string;
  locale: SupportedLocale;
  options?: DateTimeFormatOptions;
}) => new Intl.DateTimeFormat(locale, options).format(new Date(date));
