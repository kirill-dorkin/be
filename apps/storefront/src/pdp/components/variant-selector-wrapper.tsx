"use client";

import dynamic from "next/dynamic";
import { memo } from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";
import { Skeleton } from "@nimara/ui/components/skeleton";

const VariantSelector = dynamic(() => import("@/pdp/components/variant-selector").then(mod => ({ default: mod.VariantSelector })), {
  ssr: false,
  loading: () => <Skeleton className="h-24 w-full rounded-lg" />,
});

type VariantPickerProps = {
  availability: ProductAvailability;
  cart: Cart | null;
  product: Product;
};

/**
 * A thin client wrapper for the VariantSelector component.
 * Receives cart data from the ProductProvider to avoid duplicate fetches during rendering.
 */
const VariantSelectorWrapperComponent = ({
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

// Мемоизация - wrapper для селектора вариантов
export const VariantSelectorWrapper = memo(VariantSelectorWrapperComponent, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.cart?.id === nextProps.cart?.id &&
    prevProps.availability === nextProps.availability
  );
});
