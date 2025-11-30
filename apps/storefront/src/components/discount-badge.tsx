import { memo } from "react";

import { cn } from "@/lib/utils";

const DiscountBadgeComponent = ({
  className,
  discount,
}: {
  className?: string;
  discount: number | null;
}) => {
  if (!discount || discount <= 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "absolute left-2 top-2 z-10 rounded-md bg-red-600 px-2 py-1 text-xs text-white",
        className,
      )}
    >
      -{discount}%
    </span>
  );
};

// Мемоизация - используется на каждой карточке товара
export const DiscountBadge = memo(
  DiscountBadgeComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.discount === nextProps.discount &&
      prevProps.className === nextProps.className
    );
  },
);
