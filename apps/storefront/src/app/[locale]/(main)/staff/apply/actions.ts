"use server";

import { REPAIR_ROLE } from "@/lib/repair/metadata";
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

  const throttled = await sendWorkerApplicationToTelegram({
    firstName,
    lastName,
    email,
    phone,
    role:
      role === REPAIR_ROLE.courier
        ? "Курьер-доставщик"
        : "Мастер по ремонту",
    passwordLength: password.length,
  });

  if (!throttled.ok && Array.isArray(throttled.error)) {
    const hasThrottle = throttled.error.some(
      (err) =>
        err.code === "TELEGRAM_REQUEST_ERROR" &&
        err.message.toLowerCase().includes("too many") ||
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

  return throttled.ok
    ? { ok: true as const }
    : {
        ok: false as const,
        error: throttled.error,
      };
};
