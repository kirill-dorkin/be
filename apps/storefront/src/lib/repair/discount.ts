import type { User } from "@nimara/domain/objects/User";

export const REGISTERED_REPAIR_DISCOUNT_RATE = 0.2;

export type RepairDiscount = {
  percentage: number;
  reason: "registered-customer";
};

const toCurrency = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const applyRepairDiscount = (amount: number, rate: number) => {
  if (!rate || amount <= 0) {
    return toCurrency(amount);
  }

  return toCurrency(amount * (1 - rate));
};

export const calculateRepairSavings = (original: number, rate: number) => {
  const discounted = applyRepairDiscount(original, rate);

  return toCurrency(original - discounted);
};

export const getRepairDiscountForUser = (
  user: User | null | undefined,
): RepairDiscount | null => {
  if (!user?.id) {
    return null;
  }

  return {
    percentage: REGISTERED_REPAIR_DISCOUNT_RATE,
    reason: "registered-customer",
  };
};

export const hasRepairDiscount = (discount: RepairDiscount | null | undefined) =>
  !!discount && discount.percentage > 0;

export const toDiscountPercent = (rate: number) =>
  Math.round(rate * 100);

export const currencyMath = {
  toCurrency,
};
