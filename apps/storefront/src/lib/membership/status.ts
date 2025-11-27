import type { User } from "@nimara/domain/objects/User";

const VIP_METADATA_KEY = "customer:is_vip";

export const PRODUCT_VIP_DISCOUNT_PERCENT = 10;

export const isVipUser = (user: User | null | undefined) => {
  const flag = user?.metadata?.[VIP_METADATA_KEY];

  if (!flag) {
    return false;
  }

  const normalized = flag.toLowerCase();

  return normalized === "true" || normalized === "1" || normalized === "yes";
};

export const getProductSavingsAmount = (
  amount: number,
  user: User | null | undefined,
) => {
  if (!isVipUser(user) || amount <= 0) {
    return 0;
  }

  return (amount * PRODUCT_VIP_DISCOUNT_PERCENT) / 100;
};
