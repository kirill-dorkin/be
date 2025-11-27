import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { REPAIR_ROLE } from "@/lib/repair/metadata";

const payload = {
  firstName: "Ivan",
  lastName: "Petrov",
  email: "ivan@example.com",
  phone: "+996700000000",
  password: "password123",
  role: REPAIR_ROLE.worker,
};

describe("submitWorkerApplication throttle", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env.SALEOR_APP_TOKEN = "test-saleor-token";
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_CHAT_ID = "test-chat";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns RATE_LIMITED when Telegram returns 429", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}", { status: 429 }),
    );

    const { submitWorkerApplication } = await import("../actions");
    const result = await submitWorkerApplication(payload);

    expect(result.ok).toBe(false);
    expect(result.error?.[0].code).toBe("RATE_LIMITED");
  });
});
