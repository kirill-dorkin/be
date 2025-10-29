import { PlusCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { type Cart } from "@nimara/domain/objects/Cart";
import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";
import { Button } from "@nimara/ui/components/button";
import { Skeleton } from "@nimara/ui/components/skeleton";

import { VariantSelector } from "@/pdp/components/variant-selector";

type VariantPickerProps = {
  availability: ProductAvailability;
  cart: Cart | null;
  product: Product;
};

/**
 * A thin server wrapper for the VariantSelector component.
 * Receives cart data from the ProductProvider to avoid duplicate fetches during rendering.
 */
export const VariantSelectorWrapper = ({
  availability,
  cart,
  product,
}: VariantPickerProps) => {
  return (
    <VariantSelector
      cart={cart}
      product={product}
      productAvailability={availability}
    />
  );
};

export const VariantSelectorSkeleton = async () => {
  const t = await getTranslations();

  return (
    <div>
      <Skeleton className="mb-4 h-8 w-1/4" />
      <Skeleton className="mb-4 h-8 w-full" />
      <Skeleton className="mb-4 h-8 w-full" />

      <div className="flex flex-wrap gap-2">
        <Skeleton className="mb-4 h-8 w-1/4" />
        <Skeleton className="mb-4 h-8 w-1/4" />
        <Skeleton className="mb-4 h-8 w-1/4" />
      </div>

      <Button className="my-4 w-full" disabled={true}>
        <PlusCircle className="mr-2 h-4" />
        {t("common.add-to-bag")}
      </Button>
    </div>
  );
};
