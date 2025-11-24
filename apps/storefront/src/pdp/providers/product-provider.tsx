import { notFound } from "next/navigation";

import { type Cart } from "@nimara/domain/objects/Cart";
import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";
import { type User } from "@nimara/domain/objects/User";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { getCheckoutId } from "@/lib/actions/cart";
import { JsonLd, productToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { getCartService } from "@/services/cart";
import { getStoreService } from "@/services/store";
import { getUserService } from "@/services/user";

type ProductProviderContext = {
  cart: Cart | null;
  user: User | null;
};

export const ProductProvider = async ({
  render,
  slug,
}: {
  render: (
    data: Product,
    availability: ProductAvailability,
    context: ProductProviderContext,
  ) => React.ReactNode;
  slug: string;
}) => {
  const [region, storeService, checkoutId, cartService, accessToken, userService] = await Promise.all([
    getCurrentRegion(),
    getStoreService(),
    getCheckoutId(),
    getCartService(),
    getAccessToken(),
    getUserService(),
  ]);

  const productDetailsPromise = storeService.getProductDetails({
    productSlug: slug,
    countryCode: region.market.countryCode,
    channel: region.market.channel,
    languageCode: region.language.code,
    options: {
      next: {
        revalidate: CACHE_TTL.pdp,
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
      },
    },
  });

  const cartPromise = checkoutId
    ? cartService.cartGet({
        cartId: checkoutId,
        languageCode: region.language.code,
        countryCode: region.market.countryCode,
        options: {
          next: {
            revalidate: 0, // Always fetch fresh cart data on PDP
            tags: [`CHECKOUT:${checkoutId}`],
          },
        },
      })
    : Promise.resolve(null);

  const userPromise = accessToken
    ? userService.userGet(accessToken)
    : Promise.resolve(null);

  const [{ data }, cartResult, userResult] = await Promise.all([
    productDetailsPromise,
    cartPromise,
    userPromise,
  ]);

  if (!data?.product) {
    return notFound();
  }

  const cart =
    cartResult && typeof cartResult === "object" && "ok" in cartResult
      ? cartResult.ok
        ? cartResult.data
        : null
      : null;

  const user =
    userResult && typeof userResult === "object" && "ok" in userResult
      ? userResult.data
      : null;

  return (
    <>
      {render(data.product, data.availability, { cart, user })}

      <JsonLd jsonLd={productToJsonLd(data.product, data?.availability)} />
    </>
  );
};
