import { describe, expect, it } from "vitest";

import { type User } from "@nimara/domain/objects/User";

import { getVipSavingsSummary } from "../status";

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

describe("getVipSavingsSummary", () => {
  it("returns zero savings for non-VIP", () => {
    const result = getVipSavingsSummary(1000, regularUser);

    expect(result.isVip).toBe(false);
    expect(result.actualSavings).toBe(0);
    expect(result.potentialSavings).toBe(0);
  });

  it("returns discounted savings for VIP", () => {
    const result = getVipSavingsSummary(1000, vipUser);

    expect(result.isVip).toBe(true);
    expect(result.actualSavings).toBeGreaterThan(0);
    expect(result.potentialSavings).toEqual(result.actualSavings);
  });
});
