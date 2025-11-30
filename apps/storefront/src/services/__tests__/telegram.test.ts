import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const validPayload = {
  firstName: "Ivan",
  lastName: "Petrov",
  email: "ivan@example.com",
  phone: "+996700000000",
  role: "Мастер по ремонту",
  passwordLength: 8,
};

const loadService = async () =>
  import("../telegram").then((mod) => mod.sendWorkerApplicationToTelegram);

describe("sendWorkerApplicationToTelegram", () => {
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

  it("returns ok when Telegram responds 200", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}", { status: 200 }),
    );

    const send = await loadService();
    const result = await send(validPayload);

    expect(result.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("returns error message from Telegram API on non-200", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ description: "Bad chat id" }), {
        status: 400,
      }),
    );

    const send = await loadService();
    const result = await send(validPayload);

    expect(result.ok).toBe(false);
    expect(result.error?.[0].message).toContain("Bad chat id");
  });

  it("returns timeout error on abort", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new DOMException("Aborted", "AbortError"),
    );

    const send = await loadService();
    const result = await send(validPayload);

    expect(result.ok).toBe(false);
    expect(result.error?.[0].message).toContain("timed out");
  });
});
