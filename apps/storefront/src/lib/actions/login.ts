"use server";

import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";

import { getAccessToken, signIn } from "@/auth";
import { CACHE_TTL } from "@/config";
import { serverEnvs } from "@/envs/server";
import { getCheckoutId, setCheckoutIdCookie } from "@/lib/actions/cart";
import { paths } from "@/lib/paths";
import {
  isApprovedRepairWorker,
  isPendingRepairWorker,
} from "@/lib/repair/metadata";
import { getCurrentRegion } from "@/regions/server";
import { getCartService } from "@/services/cart";
import { getCheckoutService } from "@/services/checkout";
import { errorService } from "@/services/error";
import { storefrontLogger } from "@/services/logging";
import { getUserService } from "@/services/user";

export async function login({
  email,
  password,
  redirectUrl,
}: {
  email: string;
  password: string;
  redirectUrl?: string;
}) {
  let isRepairStaff = false;
  let isPendingWorker = false;

  storefrontLogger.info("[Login] Attempting login", { email, redirectUrl });

  try {
    storefrontLogger.info("[Login] Calling NextAuth signIn", { email });

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    storefrontLogger.debug("[Login] SignIn result received", {
      hasResult: !!signInResult,
      hasError: !!signInResult?.error,
      error: signInResult?.error,
      ok: signInResult?.ok,
    });

    if (!signInResult) {
      storefrontLogger.error("[Login] SignIn returned null/undefined");
      errorService.logError(new Error(`Sign in returned null for ${email}`));

      return { error: true };
    }

    if (signInResult.error) {
      storefrontLogger.error("[Login] Sign in failed with error", {
        error: signInResult.error,
        email,
      });
      errorService.logError(
        new Error(`Sign in failed for ${email}: ${signInResult.error}`),
      );

      return { error: true };
    }

    storefrontLogger.info("[Login] NextAuth sign in successful", { email });

    const [accessToken, checkoutId, userService, checkoutService] =
      await Promise.all([
        getAccessToken(),
        getCheckoutId(),
        getUserService(),
        getCheckoutService(),
      ]);

    storefrontLogger.debug("[Login] Retrieved tokens and services", {
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length || 0,
      hasCheckoutId: !!checkoutId,
    });

    const resultUserGet = await userService.userGet(accessToken);
    const user = resultUserGet.ok ? resultUserGet.data : null;
    const repairGroupName = serverEnvs.SERVICE_WORKER_GROUP_NAME;

    const belongsToRepairGroup = Boolean(
      user?.isStaff &&
        user.permissionGroups?.some((group) => group.name === repairGroupName),
    );

    isRepairStaff =
      belongsToRepairGroup || isApprovedRepairWorker(user?.metadata);
    isPendingWorker = isPendingRepairWorker(user?.metadata);

    if (user?.checkoutIds.length) {
      const userLatestCheckoutId = user.checkoutIds[0];

      await setCheckoutIdCookie(userLatestCheckoutId);

      if (checkoutId) {
        const region = await getCurrentRegion();
        const regionSettings = {
          countryCode: region.market.countryCode,
          languageCode: region.language.code,
        };
        const [resultGuestCheckout, resultUserCheckout] = await Promise.all([
          checkoutService.checkoutGet({
            checkoutId,
            ...regionSettings,
          }),
          checkoutService.checkoutGet({
            checkoutId: userLatestCheckoutId,
            ...regionSettings,
          }),
        ]);

        const userCheckout = resultUserCheckout.data?.checkout;
        const guestCheckout = resultGuestCheckout.data?.checkout;

        if (userCheckout) {
          const cartService = await getCartService();

          const lineItemsFromGuestCheckout =
            guestCheckout?.lines.filter((line) =>
              userCheckout?.lines.some(
                (userLine) => userLine.variant.id !== line?.variant.id,
              ),
            ) ?? [];

          await cartService.linesAdd({
            cartId: userCheckout.id,
            lines: lineItemsFromGuestCheckout.map(({ quantity, variant }) => ({
              quantity,
              variantId: variant.id,
            })),
            channel: region.market.channel,
            email: user.email,
            languageCode: region.language.code,
            options: {
              next: {
                revalidate: CACHE_TTL.cart,
                tags: [`CHECKOUT:${userCheckout.id}`],
              },
            },
          });
        }
      }
    } else if (checkoutId) {
      await checkoutService.checkoutCustomerAttach({
        accessToken,
        id: checkoutId,
      });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      storefrontLogger.error("[Login] AuthError occurred", {
        type: error.type,
        email,
      });

      switch (error.type) {
        case "CredentialsSignin":
          storefrontLogger.error("[Login] Invalid credentials", { email });

          return { error: true };
        default:
          errorService.logError(error);

          return { error: true };
      }
    }

    storefrontLogger.error("[Login] Unexpected error", { error, email });

    return { error: true };
  }

  revalidatePath(paths.home.asPath());

  const defaultRedirect = paths.home.asPath({ query: { loggedIn: "true" } });

  const resolvedRedirect = redirectUrl
    ? redirectUrl
    : isRepairStaff || isPendingWorker
      ? paths.staff.orders.asPath()
      : defaultRedirect;

  storefrontLogger.info("[Login] Login successful", {
    email,
    redirectUrl: resolvedRedirect,
    isRepairStaff,
    isPendingWorker,
  });

  revalidatePath(resolvedRedirect);

  return {
    redirectUrl: resolvedRedirect,
  };
}
