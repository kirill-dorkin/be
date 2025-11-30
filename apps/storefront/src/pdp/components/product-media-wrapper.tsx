"use client";

import dynamic from "next/dynamic";
import { memo } from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";
import { Skeleton } from "@nimara/ui/components/skeleton";

const ProductMedia = dynamic(
  () =>
    import("./product-media").then((mod) => ({ default: mod.ProductMedia })),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-square w-full rounded-lg" />,
  },
);

type ProductMediaWrapperProps = {
  availability: ProductAvailability;
  cart: Cart | null;
  product: Product;
  showAs?: "vertical" | "carousel";
};

const ProductMediaWrapperComponent = ({
  product,
  availability,
  showAs,
  cart,
}: ProductMediaWrapperProps) => {
  return (
    <ProductMedia
      product={product}
      media={product.images}
      variants={product.variants}
      availability={availability}
      cart={cart}
      showAs={showAs}
    />
  );
};

// Мемоизация - wrapper для медиа галереи товара
export const ProductMediaWrapper = memo(
  ProductMediaWrapperComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.cart?.id === nextProps.cart?.id &&
      prevProps.showAs === nextProps.showAs &&
      prevProps.availability === nextProps.availability
    );
  },
);
