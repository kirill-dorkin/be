import { beforeEach, describe, expect, it, vi } from "vitest";

import { submitWorkerApplication } from "../actions";

vi.mock("@/regions/server", () => ({
  getCurrentRegion: vi.fn(async () => ({
    market: { channel: "default-channel" },
    language: { code: "EN", locale: "en-US" },
  })),
}));

vi.mock("@/services/auth", () => ({
  getAuthService: vi.fn(),
}));

vi.mock("@/lib/account-confirmation", () => ({
  getAccountConfirmationRedirectUrl: vi.fn(async () => "https://best.com/confirm-account-registration"),
}));

import { getAuthService } from "@/services/auth";

describe("submitWorkerApplication", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const validPayload = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1234567890",
    password: "Pass12345",
  } as const;

  it("returns ok on successful registration", async () => {
    const mockedGetAuthService = getAuthService as unknown as vi.Mock;

    mockedGetAuthService.mockResolvedValue({
      accountRegister: vi.fn().mockResolvedValue({ ok: true, data: { success: true } }),
    });

    const result = await submitWorkerApplication(validPayload);

    expect(result.ok).toBe(true);
  });

  it("propagates saleor errors when registration fails", async () => {
    const errors = [
      { code: "UNIQUE_ERROR", message: "Email already used", field: "email" },
    ];

    const mockedGetAuthService = getAuthService as unknown as vi.Mock;

    mockedGetAuthService.mockResolvedValue({
      accountRegister: vi.fn().mockResolvedValue({ ok: false, errors }),
    });

    const result = await submitWorkerApplication(validPayload);

    expect(result.ok).toBe(false);
    expect(result.error).toEqual(errors);
  });
});
