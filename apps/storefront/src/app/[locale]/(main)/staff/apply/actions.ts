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

  const telegramResult = await sendWorkerApplicationToTelegram({
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

  return telegramResult.ok
    ? { ok: true as const }
    : {
        ok: false as const,
        error: telegramResult.error,
      };
};
