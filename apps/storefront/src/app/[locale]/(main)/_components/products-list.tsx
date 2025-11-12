"use client";

import { memo, useEffect, useMemo, useState } from "react";

import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";

import { SearchProductCard } from "@/components/search-product-card";
import { useInView } from "@/lib/use-in-view";

type Props = {
  products: SearchProduct[];
};

const BATCH_SIZE = 16;

export const ProductsList = ({ products }: Props) => {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(BATCH_SIZE, products.length),
  );
  const { ref: sentinelRef, isIntersecting } = useInView<HTMLDivElement>({
    rootMargin: "400px",
  });

  useEffect(() => {
    setVisibleCount(Math.min(BATCH_SIZE, products.length));
  }, [products]);

  useEffect(() => {
    if (!isIntersecting) {
      return;
    }

    setVisibleCount((current) => {
      if (current >= products.length) {
        return current;
      }

      return Math.min(current + BATCH_SIZE, products.length);
    });
  }, [isIntersecting, products.length]);

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount],
  );

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {visibleProducts.map((product) => (
          <MemoizedProductCard key={product.id} product={product} />
        ))}
      </div>
      {visibleCount < products.length ? (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className="h-1 w-full opacity-0"
        />
      ) : null}
    </>
  );
};

const MemoizedProductCard = memo(SearchProductCard, (prev, next) => {
  return prev.product.id === next.product.id &&
         prev.product.price.amount === next.product.price.amount;
});
