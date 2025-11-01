import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { getCheckoutId } from "@/lib/actions/cart";
import { getCurrentRegion } from "@/regions/server";
import { getCartService } from "@/services/cart";
import { storefrontLogger } from "@/services/logging";
import { getUserService } from "@/services/user";

import { CartDetails } from "./cart-details";
import { EmptyCart } from "./empty-cart";

export const Cart = async () => {
  // Parallelize all initial data fetching
  const [checkoutId, region, cartService, accessToken, userService] =
    await Promise.all([
      getCheckoutId(),
      getCurrentRegion(),
      getCartService(),
      getAccessToken(),
      getUserService(),
    ]);

  if (!checkoutId) {
    storefrontLogger.debug("No checkoutId cookie. Rendering empty cart.");

    return <EmptyCart />;
  }

  // Parallelize cart and user data fetching
  const [resultCartGet, resultUserGet] = await Promise.all([
    cartService.cartGet({
      cartId: checkoutId,
      languageCode: region.language.code,
      countryCode: region.market.countryCode,
      options: {
        next: { revalidate: CACHE_TTL.cart, tags: [`CHECKOUT:${checkoutId}`] },
      },
    }),
    userService.userGet(accessToken),
  ]);

  if (!resultCartGet.ok) {
    storefrontLogger.error("Failed to fetch cart", {
      error: resultCartGet.errors,
    });

    return <EmptyCart />;
  }

  if (!!resultCartGet.data.lines.length) {
    const user = resultUserGet.ok ? resultUserGet.data : null;

    return (
      <CartDetails region={region} cart={resultCartGet.data} user={user} />
    );
  }

  storefrontLogger.error("Rendering empty Cart due to errors.", {
    error: resultCartGet.errors,
    checkoutId,
  });

  return <EmptyCart />;
};
