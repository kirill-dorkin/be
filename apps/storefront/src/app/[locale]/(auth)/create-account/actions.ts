"use server";

import { revalidatePath } from "next/cache";

import { err } from "@nimara/domain/objects/Result";

import { getAccountConfirmationRedirectUrl } from "@/lib/account-confirmation";
import { shouldRetryAccountRegisterWithRedirect } from "@/lib/account-register";
import { initializeReferralData } from "@/lib/actions/init-referral";
import { login } from "@/lib/actions/login";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { getAuthService } from "@/services/auth";
import { storefrontLogger } from "@/services/logging";

import { type FormSchema } from "./schema";

export async function registerAccount(values: FormSchema) {
  const region = await getCurrentRegion();
  const { firstName, lastName, email, password, referralCode } = values;
  const authService = await getAuthService();

  storefrontLogger.info("[RegisterAccount] Starting registration", {
    email,
    channel: region?.market?.channel,
    languageCode: region?.language?.code,
  });

  const register = async (redirectUrl?: string) => {
    const params = {
      firstName,
      lastName,
      email,
      password,
      channel: region?.market?.channel,
      languageCode: region?.language?.code,
      ...(redirectUrl ? { redirectUrl } : {}),
    };

    storefrontLogger.debug("[RegisterAccount] Calling Saleor accountRegister", {
      hasRedirectUrl: !!redirectUrl,
    });

    return authService.accountRegister(params);
  };

  let result = await register();
  let requiresEmailConfirmation = false;

  storefrontLogger.debug("[RegisterAccount] Initial registration result", {
    success: result.ok,
    errorCount: result.ok ? 0 : result.errors?.length,
  });

  if (!result.ok && shouldRetryAccountRegisterWithRedirect(result.errors)) {
    storefrontLogger.info(
      "[RegisterAccount] Email confirmation required, retrying with redirect URL",
    );
    requiresEmailConfirmation = true;
    const redirectUrl = await getAccountConfirmationRedirectUrl();

    storefrontLogger.debug("[RegisterAccount] Redirect URL", { redirectUrl });
    result = await register(redirectUrl);

    storefrontLogger.debug("[RegisterAccount] Second registration result", {
      success: result.ok,
      errorCount: result.ok ? 0 : result.errors?.length,
    });
  }

  if (!result.ok) {
    storefrontLogger.error("[RegisterAccount] Registration failed", {
      errors: result.errors,
    });

    return result;
  }

  storefrontLogger.info("[RegisterAccount] Registration successful", {
    requiresEmailConfirmation,
  });

  revalidatePath(paths.createAccount.asPath());

  // If email confirmation is required, don't attempt automatic login
  if (requiresEmailConfirmation) {
    storefrontLogger.info(
      "[RegisterAccount] Skipping automatic login - email confirmation required",
    );

    return {
      ok: true as const,
      data: {
        success: true,
        requiresEmailConfirmation: true,
        redirectUrl: paths.signIn.asPath({
          query: { registered: "true", confirmEmail: "true" },
        }),
      },
    };
  }

  storefrontLogger.info("[RegisterAccount] Attempting automatic login");

  const loginResult = await login({
    email,
    password,
    redirectUrl: paths.account.profile.asPath({
      query: { referralPromo: "true" },
    }),
  });

  storefrontLogger.debug("[RegisterAccount] Login result", {
    hasError: !!loginResult?.error,
    hasRedirectUrl: !!loginResult?.redirectUrl,
    redirectUrl: loginResult?.redirectUrl,
  });

  if (!loginResult || loginResult.error) {
    return err([
      {
        code: "LOGIN_AFTER_REGISTER_ERROR",
        field: "email",
        message: "Account created successfully, but automatic login failed. Please try logging in manually.",
      },
    ]);
  }

  if (!loginResult.redirectUrl) {
    return err([
      {
        code: "LOGIN_AFTER_REGISTER_ERROR",
        field: "email",
        message: "Account created successfully, but redirect failed. Please try logging in.",
      },
    ]);
  }

  // Initialize referral data for new user
  storefrontLogger.info("[RegisterAccount] Initializing referral data", {
    hasReferralCode: !!referralCode,
  });

  await initializeReferralData(referralCode);

  return {
    ok: true as const,
    data: {
      success: true,
      redirectUrl: loginResult.redirectUrl,
    },
  };
}
