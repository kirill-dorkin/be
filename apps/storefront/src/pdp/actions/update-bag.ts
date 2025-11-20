"use server";

import { getCheckoutId, revalidateCart } from "@/lib/actions/cart";
import { getCartService } from "@/services/cart";
import { getStorefrontLogger } from "@/services/lazy-logging";

type UpdateBagActionProps = {
  lineId: string;
  quantity: number;
};

/**
 * Server action to update the quantity of an item in the cart.
 * @param props - The line ID and new quantity
 * @returns The result of the update operation
 */
export const updateBagAction = async ({
  lineId,
  quantity,
}: UpdateBagActionProps) => {
  const storefrontLogger = await getStorefrontLogger();
  const cartService = await getCartService();

  storefrontLogger.debug("Updating bag item quantity", { lineId, quantity });

  const cookieCartId = await getCheckoutId();

  if (!cookieCartId) {
    storefrontLogger.error("No cart ID found in cookie");

    return {
      ok: false,
      errors: [{ field: "cartId", message: "No cart found" }],
    } as const;
  }

  // Update the line quantity
  const result = await cartService.linesUpdate({
    cartId: cookieCartId,
    lines: [{ lineId, quantity }],
  });

  if (result.ok) {
    // Revalidate cart cache immediately
    await revalidateCart(cookieCartId);

    storefrontLogger.debug("Item quantity updated successfully", {
      lineId,
      quantity,
      cartId: cookieCartId,
    });

    return {
      ok: true,
      data: { success: true },
    } as const;
  }

  storefrontLogger.error("Failed to update item quantity", {
    lineId,
    quantity,
    errors: result.errors,
  });

  return result;
};
