"use server";

import { type User } from "@nimara/domain/objects/User";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import {
  getCheckoutId,
  revalidateCart,
  setCheckoutIdCookie,
} from "@/lib/actions/cart";
import { getCurrentRegion } from "@/regions/server";
import { getCartService } from "@/services/cart";
import { storefrontLogger } from "@/services/logging";
import { getUserService } from "@/services/user";

export const addToBagAction = async ({
  variantId,
  quantity = 1,
}: {
  quantity?: number;
  variantId: string;
}) => {
  storefrontLogger.debug("Adding item to bag", { variantId, quantity });

  const [region, cookieCartId, cartService] = await Promise.all([
    getCurrentRegion(),
    getCheckoutId(),
    getCartService(),
  ]);

  let user: User | null = null;
  const token = await getAccessToken();

  if (token) {
    const userService = await getUserService();
    const userGetResult = await userService.userGet(token);

    if (userGetResult.ok) {
      user = userGetResult.data;
    }
  }

  // Check if item already exists in cart
  if (cookieCartId) {
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

    if (cartGetResult.ok) {
      const existingItem = cartGetResult.data.lines.find(
        (line) => line.variant.id === variantId,
      );

      if (existingItem) {
        storefrontLogger.debug("Item already exists in cart", { variantId });

        return {
          ok: false,
          errors: [
            {
              field: "ITEM_ALREADY_IN_CART",
              message: "This item is already in your cart",
            },
          ],
        } as const;
      }
    }
  }

  const result = await cartService.linesAdd({
    email: user?.email,
    channel: region.market.channel,
    languageCode: region.language.code,
    cartId: cookieCartId,
    lines: [{ variantId, quantity }],
    options: cookieCartId
      ? {
          next: {
            tags: [`CHECKOUT:${cookieCartId}`],
            revalidate: CACHE_TTL.cart,
          },
        }
      : undefined,
  });

  if (result.ok) {
    if (!cookieCartId) {
      // Save the cartId in the cookie for future requests
      await setCheckoutIdCookie(result.data.cartId);
    }

    await revalidateCart(cookieCartId ?? result.data.cartId);
  }

  return result;
};
