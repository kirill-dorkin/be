import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { REPAIR_ROLE } from "@/lib/repair/metadata";

const validPayload = {
  firstName: "Ivan",
  lastName: "Petrov",
  email: "ivan@example.com",
  phone: "+996700000000",
  password: "password123",
  role: REPAIR_ROLE.worker,
};

describe("submitWorkerApplication", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env.SALEOR_APP_TOKEN = "test-saleor-token";
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_CHAT_ID = "test-chat";
    delete process.env.TELEGRAM_THREAD_ID;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ok true when Telegram accepts the request", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}", { status: 200 }),
    );

    const { submitWorkerApplication } = await import("../actions");
    const result = await submitWorkerApplication(validPayload);

    expect(result.ok).toBe(true);
  });

  it("propagates Telegram errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ description: "Bad chat id" }), {
        status: 400,
      }),
    );

    const { submitWorkerApplication } = await import("../actions");
    const result = await submitWorkerApplication(validPayload);

    expect(result.ok).toBe(false);
    expect(result.error?.[0].message).toContain("Bad chat id");
  });
});
