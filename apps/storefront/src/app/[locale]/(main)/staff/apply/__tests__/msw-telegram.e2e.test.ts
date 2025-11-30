import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { REPAIR_ROLE } from "@/lib/repair/metadata";

const payload = {
  firstName: "Ivan",
  lastName: "Petrov",
  email: "ivan@example.com",
  phone: "+996700000000",
  password: "password123",
  role: REPAIR_ROLE.worker,
};

const server = setupServer();

describe("Worker application -> Telegram (msw)", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env.SALEOR_APP_TOKEN = "test-saleor-token";
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_CHAT_ID = "test-chat";
  });

  it("succeeds on happy path", async () => {
    server.use(
      http.post("https://api.telegram.org/*/sendMessage", () =>
        HttpResponse.json({ ok: true }),
      ),
    );

    const { submitWorkerApplication } = await import("../actions");
    const result = await submitWorkerApplication(payload);

    expect(result.ok).toBe(true);
  });

  it("returns RATE_LIMITED on 429", async () => {
    server.use(
      http.post(
        "https://api.telegram.org/*/sendMessage",
        () => new HttpResponse(null, { status: 429 }),
      ),
    );

    const { submitWorkerApplication } = await import("../actions");
    const result = await submitWorkerApplication(payload);

    expect(result.ok).toBe(false);
    expect(result.error?.[0].code).toBe("RATE_LIMITED");
  });
});
