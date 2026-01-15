import { beforeEach, describe, expect, it, vi } from "vitest";

import { REPAIR_ROLE } from "@/lib/repair/metadata";
import type { sendWorkerApplicationToTelegram } from "@/services/telegram";

const sendWorkerApplicationToTelegramMock = vi.hoisted(() =>
  vi.fn<
    Parameters<typeof sendWorkerApplicationToTelegram>,
    ReturnType<typeof sendWorkerApplicationToTelegram>
  >(),
);
const storefrontLoggerMock = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}));

vi.mock("@/services/telegram", () => ({
  sendWorkerApplicationToTelegram: (
    ...args: Parameters<typeof sendWorkerApplicationToTelegram>
  ) => sendWorkerApplicationToTelegramMock(...args),
}));
vi.mock("@/services/logging", () => ({
  storefrontLogger: storefrontLoggerMock,
}));

const validPayload = {
  firstName: "Ivan",
  lastName: "Petrov",
  email: "ivan@example.com",
  phone: "+996700000000",
  password: "password123",
  role: REPAIR_ROLE.worker,
};

const loadAction = async () => {
  const { submitWorkerApplication } = await import("../actions");

  return submitWorkerApplication;
};

beforeEach(() => {
  vi.resetModules();
  sendWorkerApplicationToTelegramMock.mockReset();
  storefrontLoggerMock.error.mockReset();
  storefrontLoggerMock.info.mockReset();
  sendWorkerApplicationToTelegramMock.mockResolvedValue({ ok: true });
});

describe("submitWorkerApplication (Telegram only)", () => {
  it("returns validation errors for invalid payload", async () => {
    const submitWorkerApplication = await loadAction();
    const result = await submitWorkerApplication({
      ...validPayload,
      email: "invalid-email",
    });

    if (result.ok) {
      throw new Error("Expected validation failure");
    }

    expect(result.error.fieldErrors.email?.[0]).toBe("errors.email.invalid");
    expect(sendWorkerApplicationToTelegramMock).not.toHaveBeenCalled();
  });

  it("succeeds when Telegram returns ok", async () => {
    const submitWorkerApplication = await loadAction();
    const result = await submitWorkerApplication(validPayload);

    expect(result.ok).toBe(true);
    expect(sendWorkerApplicationToTelegramMock).toHaveBeenCalledWith({
      email: validPayload.email,
      firstName: validPayload.firstName,
      lastName: validPayload.lastName,
      phone: validPayload.phone,
      role: "Мастер по ремонту",
      passwordLength: validPayload.password.length,
    });
  });

  it("uses courier label when role is courier", async () => {
    const courierPayload = { ...validPayload, role: REPAIR_ROLE.courier };
    const submitWorkerApplication = await loadAction();
    const result = await submitWorkerApplication(courierPayload);

    expect(result.ok).toBe(true);
    expect(sendWorkerApplicationToTelegramMock).toHaveBeenCalledWith({
      email: courierPayload.email,
      firstName: courierPayload.firstName,
      lastName: courierPayload.lastName,
      phone: courierPayload.phone,
      role: "Курьер-доставщик",
      passwordLength: courierPayload.password.length,
    });
  });

  it("maps Telegram rate limits to a friendly message", async () => {
    sendWorkerApplicationToTelegramMock.mockResolvedValueOnce({
      ok: false,
      error: [
        {
          code: "RATE_LIMITED",
          message: "Too many requests",
        },
      ],
    });

    const submitWorkerApplication = await loadAction();
    const result = await submitWorkerApplication(validPayload);

    if (result.ok) {
      throw new Error("Expected rate limit error");
    }

    expect(result.error[0]).toEqual({
      code: "RATE_LIMITED",
      message: "Вы уже отправили заявку недавно. Попробуйте позже.",
    });
  });

  it("surfaces unexpected Telegram errors", async () => {
    sendWorkerApplicationToTelegramMock.mockResolvedValueOnce({
      ok: false,
      error: [
        {
          code: "TELEGRAM_REQUEST_ERROR",
          message: "Bad chat id",
        },
      ],
    });

    const submitWorkerApplication = await loadAction();
    const result = await submitWorkerApplication(validPayload);

    if (result.ok) {
      throw new Error("Expected Telegram error");
    }

    expect(result.error[0].message).toBe("Bad chat id");
  });
});
