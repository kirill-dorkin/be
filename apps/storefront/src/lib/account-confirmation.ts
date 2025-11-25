import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { paths } from "@/lib/paths";
import { getStoreUrl, getStoreUrlWithPath } from "@/lib/server";
import { storefrontLogger } from "@/services/logging";

const confirmationPath = paths.confirmAccountRegistration.asPath();

const buildUrlFromBase = (base: string | undefined | null) => {
  if (!base) {
    return null;
  }

  return getStoreUrlWithPath(base, confirmationPath);
};

export async function getAccountConfirmationRedirectUrl(): Promise<string> {
  if (serverEnvs.ACCOUNT_CONFIRMATION_REDIRECT_URL) {
    return serverEnvs.ACCOUNT_CONFIRMATION_REDIRECT_URL;
  }

  const fromClientEnv = buildUrlFromBase(clientEnvs.NEXT_PUBLIC_STOREFRONT_URL);

  if (fromClientEnv) {
    return fromClientEnv;
  }

  const fallback = buildUrlFromBase(await getStoreUrl());

  if (!fallback) {
    storefrontLogger.error(
      "[AccountConfirmation] Unable to resolve fallback confirmation URL.",
    );

    throw new Error("Missing storefront URL configuration.");
  }

  if (fallback.startsWith("http://localhost")) {
    storefrontLogger.warning(
      "[AccountConfirmation] Confirmation redirect points to localhost. Configure NEXT_PUBLIC_STOREFRONT_URL or SALEOR_ACCOUNT_CONFIRMATION_REDIRECT_URL for production-ready links.",
      { fallback },
    );
  }

  return fallback;
}
