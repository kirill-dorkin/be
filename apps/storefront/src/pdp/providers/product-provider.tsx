import { notFound } from "next/navigation";

import { type Cart } from "@nimara/domain/objects/Cart";
import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";

import { CACHE_TTL } from "@/config";
import { getCheckoutId } from "@/lib/actions/cart";
import { JsonLd, productToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { getCartService } from "@/services/cart";
import { getStoreService } from "@/services/store";

type ProductProviderContext = {
  cart: Cart | null;
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
  const [region, storeService, checkoutId, cartService] = await Promise.all([
    getCurrentRegion(),
    getStoreService(),
    getCheckoutId(),
    getCartService(),
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
            revalidate: CACHE_TTL.cart,
            tags: [`CHECKOUT:${checkoutId}`],
          },
        },
      })
    : Promise.resolve(null);

  const [{ data }, cartResult] = await Promise.all([
    productDetailsPromise,
    cartPromise,
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

  return (
    <>
      {render(data.product, data.availability, { cart })}

      <JsonLd jsonLd={productToJsonLd(data.product, data?.availability)} />
    </>
  );
};
