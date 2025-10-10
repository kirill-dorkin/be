import type { SupportedCurrency } from "@/regions/types";

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: "$",
  GBP: "£",
  RUB: "₽",
  KGS: "с",
};

export const getCurrencySymbol = (currency: SupportedCurrency) =>
  CURRENCY_SYMBOLS[currency] ?? currency;

const USD_BASE_RATES: Record<SupportedCurrency, number> = {
  USD: 1,
  GBP: 0.78,
  RUB: 92,
  KGS: 90,
};

export const convertFromUSD = (
  amount: number | null | undefined,
  currency: SupportedCurrency,
) => {
  const numericAmount =
    typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  const rate = USD_BASE_RATES[currency] ?? 1;

  return numericAmount * rate;
};
