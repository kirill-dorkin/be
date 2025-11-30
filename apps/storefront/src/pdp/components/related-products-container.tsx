import { getTranslations } from "next-intl/server";

import { CACHE_TTL } from "@/config";
import { RelatedProducts } from "@/pdp/components/related-products";
import { getCurrentRegion } from "@/regions/server";
import { getStoreService } from "@/services/store";

type Props = {
  slug: string;
};

export const RelatedProductsContainer = async ({ slug }: Props) => {
  const [region, storeService, t] = await Promise.all([
    getCurrentRegion(),
    getStoreService(),
    getTranslations("products"),
  ]);

  const result = await storeService.getProductRelatedProducts({
    productSlug: slug,
    channel: region.market.channel,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    options: {
      next: {
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
        revalidate: CACHE_TTL.pdp,
      },
    },
  });

  if (!result?.data?.products?.length) {
    return null;
  }

  return (
    <RelatedProducts
      products={result.data.products}
      title={t("you-may-also-like")}
    />
  );
};
