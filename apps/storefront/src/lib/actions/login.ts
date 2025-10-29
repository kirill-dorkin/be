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

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    const [accessToken, checkoutId, userService, checkoutService] =
      await Promise.all([
        getAccessToken(),
        getCheckoutId(),
        getUserService(),
        getCheckoutService(),
      ]);

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
      switch (error.type) {
        case "CredentialsSignin":
          return { error: true };
        default:
          errorService.logError(error);

          return { error: true };
      }
    }

    return { error: true };
  }

  revalidatePath(paths.home.asPath());

  const defaultRedirect = paths.home.asPath({ query: { loggedIn: "true" } });

  const resolvedRedirect = redirectUrl
    ? redirectUrl
    : isRepairStaff || isPendingWorker
      ? paths.staff.orders.asPath()
      : defaultRedirect;

  revalidatePath(resolvedRedirect);

  return {
    redirectUrl: resolvedRedirect,
  };
}
