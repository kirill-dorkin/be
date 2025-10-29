import { type Cart } from "@nimara/domain/objects/Cart";
import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";

import { ProductMedia } from "./product-media";

type ProductMediaWrapperProps = {
  availability: ProductAvailability;
  cart: Cart | null;
  product: Product;
  showAs?: "vertical" | "carousel";
};

export const ProductMediaWrapper = ({
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
