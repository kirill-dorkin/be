"use server";

import type { Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

import { serverEnvs } from "@/envs/server";
import { paths } from "@/lib/paths";
import { getCheckoutService } from "@/services/checkout";
import { getUserService } from "@/services/user";

import type { EmailFormSchema } from "./schema";

export const checkIfUserHasAnAccount = async (email: string) => {
  console.log("🔵 [Server Action] checkIfUserHasAnAccount called with:", email);
  const userService = await getUserService();

  const data = await userService.userFind({
    email,
    saleorAppToken: serverEnvs.SALEOR_APP_TOKEN,
  });

  console.log("🔵 [Server Action] userFind result:", data);

  return data;
};

export const updateUserDetails = async ({
  email,
  checkout,
}: {
  checkout: Checkout;
  email: EmailFormSchema["email"];
}): AsyncResult<{ redirectUrl: string }> => {
  console.log("🔵 [Server Action] updateUserDetails called with:", { email, checkoutId: checkout.id, isShippingRequired: checkout.isShippingRequired });

  try {
    const checkoutService = await getCheckoutService();

    console.log("🔵 [Server Action] Calling checkoutEmailUpdate...");

    const result = await checkoutService.checkoutEmailUpdate({
      checkout,
      email: email,
    });

    console.log("🔵 [Server Action] checkoutEmailUpdate result:", result);

    if (result.ok) {
      const redirectUrl = checkout.isShippingRequired
        ? paths.checkout.shippingAddress.asPath()
        : paths.checkout.payment.asPath();

      console.log("🔵 [Server Action] Success! Redirect URL:", redirectUrl);

      return ok({
        redirectUrl,
      });
    }

    console.error("🔴 [Server Action] Checkout email update failed:", result);

    return result;
  } catch (error) {
    console.error("🔴 [Server Action] Error in updateUserDetails:", error);
    throw error;
  }
};
