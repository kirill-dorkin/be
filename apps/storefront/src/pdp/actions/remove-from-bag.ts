"use server";

import { CACHE_TTL } from "@/config";
import { getCheckoutId, revalidateCart } from "@/lib/actions/cart";
import { getCurrentRegion } from "@/regions/server";
import { getCartService } from "@/services/cart";
import { storefrontLogger } from "@/services/logging";

export const removeFromBagAction = async ({
  variantId,
}: {
  variantId: string;
}) => {
  storefrontLogger.debug("Removing item from bag", { variantId });

  const [region, cookieCartId, cartService] = await Promise.all([
    getCurrentRegion(),
    getCheckoutId(),
    getCartService(),
  ]);

  if (!cookieCartId) {
    storefrontLogger.debug("No cart found");

    return {
      ok: false,
      errors: [{ field: "CART_NOT_FOUND", message: "Cart not found" }],
    } as const;
  }

  // Get the cart to find the line ID
  const cartGetResult = await cartService.cartGet({
    cartId: cookieCartId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    options: {
      next: {
        tags: [`CHECKOUT:${cookieCartId}`],
        revalidate: CACHE_TTL.cart,
      },
    },
  });

  if (!cartGetResult.ok) {
    storefrontLogger.error("Failed to fetch cart", {
      error: cartGetResult.errors,
    });

    return {
      ok: false,
      errors: [{ field: "CART_FETCH_ERROR", message: "Failed to fetch cart" }],
    } as const;
  }

  // Find the line with the given variant ID
  const lineToRemove = cartGetResult.data.lines.find(
    (line) => line.variant.id === variantId,
  );

  if (!lineToRemove) {
    storefrontLogger.debug("Item not found in cart", { variantId });

    return {
      ok: false,
      errors: [
        { field: "ITEM_NOT_IN_CART", message: "Item not found in cart" },
      ],
    } as const;
  }

  // Remove the line from cart
  const result = await cartService.linesDelete({
    cartId: cookieCartId,
    linesIds: [lineToRemove.id],
    options: {
      next: {
        tags: [`CHECKOUT:${cookieCartId}`],
        revalidate: CACHE_TTL.cart,
      },
    },
  });

  if (result.ok) {
    await revalidateCart(cookieCartId);
  }

  return result;
};
