"use server";

import { getAccountConfirmationRedirectUrl } from "@/lib/account-confirmation";
import { shouldRetryAccountRegisterWithRedirect } from "@/lib/account-register";
import {
  REPAIR_METADATA_KEYS,
  REPAIR_STATUS,
} from "@/lib/repair/metadata";
import { getCurrentRegion } from "@/regions/server";
import { getAuthService } from "@/services/auth";

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

  const region = await getCurrentRegion();
  const authService = await getAuthService();

  const register = async (redirectUrl?: string) =>
    authService.accountRegister({
      firstName,
      lastName,
      email,
      password,
      channel: region.market.channel,
      languageCode: region.language.code,
      metadata: [
        {
          key: REPAIR_METADATA_KEYS.role,
          value: role,
        },
        {
          key: REPAIR_METADATA_KEYS.status,
          value: REPAIR_STATUS.pending,
        },
        {
          key: REPAIR_METADATA_KEYS.phone,
          value: phone,
        },
      ],
      ...(redirectUrl ? { redirectUrl } : {}),
    });

  let result = await register();

  if (!result.ok && shouldRetryAccountRegisterWithRedirect(result.errors)) {
    const redirectUrl = await getAccountConfirmationRedirectUrl();

    result = await register(redirectUrl);
  }

  if (!result.ok) {
    return {
      ok: false as const,
      error: result.errors,
    };
  }

  return {
    ok: true as const,
  };
};
