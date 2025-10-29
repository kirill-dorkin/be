"use server";

import { paths } from "@/lib/paths";
import { REPAIR_METADATA_KEYS, REPAIR_ROLE, REPAIR_STATUS } from "@/lib/repair/metadata";
import { getStoreUrl, getStoreUrlWithPath } from "@/lib/server";
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

  const { firstName, lastName, email, password, phone } = parsed.data;

  const region = await getCurrentRegion();
  const authService = await getAuthService();

  const result = await authService.accountRegister({
    firstName,
    lastName,
    email,
    password,
    channel: region.market.channel,
    languageCode: region.language.code,
    metadata: [
      {
        key: REPAIR_METADATA_KEYS.role,
        value: REPAIR_ROLE.worker,
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
    redirectUrl: getStoreUrlWithPath(
      await getStoreUrl(),
      paths.confirmAccountRegistration.asPath(),
    ),
  });

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
