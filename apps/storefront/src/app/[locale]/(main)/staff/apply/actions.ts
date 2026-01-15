"use server";

import { REPAIR_ROLE } from "@/lib/repair/metadata";
import { storefrontLogger } from "@/services/logging";
import { sendWorkerApplicationToTelegram } from "@/services/telegram";

import { applyFormSchema, type ApplyFormValues } from "./schema";

export const submitWorkerApplication = async (values: ApplyFormValues) => {
  const parsed = applyFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.flatten(),
    };
  }

  const { firstName, lastName, email, password, phone, role } = parsed.data;

  storefrontLogger.info("[WorkerApply] Submitting application (Telegram only)", {
    email,
    role,
  });

  const telegramResult = await sendWorkerApplicationToTelegram({
    firstName,
    lastName,
    email,
    phone,
    role:
      role === REPAIR_ROLE.courier ? "Курьер-доставщик" : "Мастер по ремонту",
    passwordLength: password.length,
  });

  if (!telegramResult.ok && Array.isArray(telegramResult.error)) {
    const hasThrottle = telegramResult.error.some(
      (err) =>
        (err.code === "TELEGRAM_REQUEST_ERROR" &&
          err.message.toLowerCase().includes("too many")) ||
        err.code === "RATE_LIMITED",
    );

    if (hasThrottle) {
      return {
        ok: false as const,
        error: [
          {
            code: "RATE_LIMITED",
            message: "Вы уже отправили заявку недавно. Попробуйте позже.",
          },
        ],
      };
    }
  }

  return telegramResult.ok
    ? { ok: true as const }
    : {
        ok: false as const,
        error: telegramResult.error,
      };
};
