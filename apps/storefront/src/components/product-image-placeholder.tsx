import { type ComponentProps,memo } from "react";

import ProductPlaceholder from "@/assets/product_placeholder.svg";
import { cn } from "@/lib/utils";

type ProductImagePlaceholderProps = ComponentProps<"svg">;

const ProductImagePlaceholderComponent = ({
  className,
  ...props
}: ProductImagePlaceholderProps) => (
  <ProductPlaceholder className={cn("h-auto w-full", className)} {...props} />
);

// Мемоизация - используется в галереях и карточках товаров
export const ProductImagePlaceholder = memo(ProductImagePlaceholderComponent, (prevProps, nextProps) => {
  return prevProps.className === nextProps.className;
});
