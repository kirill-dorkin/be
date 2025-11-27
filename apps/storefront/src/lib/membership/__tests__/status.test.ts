import { describe, expect, it } from "vitest";

import { type User } from "@nimara/domain/objects/User";

import {
  PRODUCT_VIP_DISCOUNT_PERCENT,
  getProductSavingsAmount,
  isVipUser,
} from "../status";

const vipUser = {
  id: "1",
  email: "vip@example.com",
  metadata: { "customer:is_vip": "true" },
} as unknown as User;

const regularUser = {
  id: "2",
  email: "user@example.com",
  metadata: {},
} as unknown as User;

describe("membership status helpers", () => {
  it("detects VIP user from metadata", () => {
    expect(isVipUser(vipUser)).toBe(true);
    expect(isVipUser(regularUser)).toBe(false);
    expect(isVipUser(null)).toBe(false);
  });

  it("returns zero savings for non-VIP", () => {
    expect(getProductSavingsAmount(1000, regularUser)).toBe(0);
    expect(getProductSavingsAmount(1000, null)).toBe(0);
  });

  it("returns percent savings for VIP", () => {
    const savings = getProductSavingsAmount(1000, vipUser);
    expect(savings).toBeCloseTo((PRODUCT_VIP_DISCOUNT_PERCENT / 100) * 1000);
  });

  it("handles non-positive amounts", () => {
    expect(getProductSavingsAmount(0, vipUser)).toBe(0);
    expect(getProductSavingsAmount(-100, vipUser)).toBe(0);
  });
});
