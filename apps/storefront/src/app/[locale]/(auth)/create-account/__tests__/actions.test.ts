import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAccountConfirmationRedirectUrl } from "@/lib/account-confirmation";
import { login } from "@/lib/actions/login";
import { getAuthService } from "@/services/auth";

import { registerAccount } from "../actions";

vi.mock("@/regions/server", () => ({
  getCurrentRegion: vi.fn(async () => ({
    market: { channel: "default-channel" },
    language: { code: "EN" },
  })),
}));

vi.mock("@/services/auth", () => ({
  getAuthService: vi.fn(),
}));

vi.mock("@/lib/account-confirmation", () => ({
  getAccountConfirmationRedirectUrl: vi.fn(async () => "https://example.com/confirm"),
}));

vi.mock("@/lib/actions/login", () => ({
  login: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockAccountRegister = vi.fn();

describe("registerAccount", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockAccountRegister.mockReset();

    vi.mocked(getAuthService).mockResolvedValue({
      accountRegister: mockAccountRegister,
      confirmAccount: vi.fn(),
      passwordSet: vi.fn(),
      requestPasswordReset: vi.fn(),
      tokenRefresh: vi.fn(),
    });
  });

  const validPayload = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "Pass1234",
    confirm: "Pass1234",
  } as const;

  it("registers without redirect and logs the user in", async () => {
    mockAccountRegister.mockResolvedValueOnce({
      ok: true,
      data: { success: true },
    });
    vi.mocked(login).mockResolvedValueOnce({
      redirectUrl: "/account/profile",
    });

    const result = await registerAccount(validPayload);

    expect(result.ok).toBe(true);
    expect(result.data?.redirectUrl).toBe("/account/profile");
    expect(mockAccountRegister).toHaveBeenCalledTimes(1);
    expect(mockAccountRegister).toHaveBeenCalledWith(
      expect.not.objectContaining({ redirectUrl: expect.any(String) }),
    );
  });

  it("retries with redirect when needed", async () => {
    mockAccountRegister
      .mockResolvedValueOnce({
        ok: false,
        errors: [
          {
            code: "ACCOUNT_REGISTER_ERROR",
            field: "redirectUrl",
            message: "Missing redirect",
            originalError: { code: "REQUIRED" },
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        data: { success: true },
      });

    vi.mocked(login).mockResolvedValueOnce({
      redirectUrl: "/account/profile",
    });

    const result = await registerAccount(validPayload);

    expect(result.ok).toBe(true);
    expect(getAccountConfirmationRedirectUrl).toHaveBeenCalled();
    expect(mockAccountRegister).toHaveBeenCalledTimes(2);

    const [, secondCallArgs] = mockAccountRegister.mock.calls;

    expect(secondCallArgs[0].redirectUrl).toBe("https://example.com/confirm");
  });

  it("returns errors when registration fails", async () => {
    mockAccountRegister.mockResolvedValueOnce({
      ok: false,
      errors: [
        {
          code: "ACCOUNT_REGISTER_ERROR",
          field: "email",
          message: "Email taken",
          originalError: { code: "INVALID" },
        },
      ],
    });

    const result = await registerAccount(validPayload);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].field).toBe("email");
    }
  });

  it("returns error when auto login fails", async () => {
    mockAccountRegister.mockResolvedValueOnce({
      ok: true,
      data: { success: true },
    });
    vi.mocked(login).mockResolvedValueOnce({ error: true });

    const result = await registerAccount(validPayload);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].code).toBe("ACCOUNT_REGISTER_ERROR");
    }
  });
});
