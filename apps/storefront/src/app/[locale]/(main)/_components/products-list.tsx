"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useMemo, useState } from "react";

import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";

import {
  CompactProductCard,
  ListProductCard,
  SearchProductCard,
} from "@/components/search-product-card";
import { type ViewMode } from "@/components/view-toggle";
import { useInView } from "@/lib/use-in-view";

type Props = {
  products: SearchProduct[];
  viewMode?: ViewMode;
};

const BATCH_SIZE = 16;

export const ProductsList = ({ products, viewMode = "compact" }: Props) => {
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

  const gridClassName = useMemo(() => {
    switch (viewMode) {
      case "compact":
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4";
      case "list":
        return "flex flex-col gap-3 md:gap-4";
      case "grid":
      default:
        return "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4";
    }
  }, [viewMode]);

  const CardComponent = useMemo(() => {
    switch (viewMode) {
      case "compact":
        return MemoizedCompactProductCard;
      case "list":
        return MemoizedListProductCard;
      case "grid":
      default:
        return MemoizedProductCard;
    }
  }, [viewMode]);

  return (
    <>
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={gridClassName}
      >
        <AnimatePresence mode="popLayout">
          {visibleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.2,
                delay: index * 0.02,
                ease: "easeOut",
              }}
              layout
            >
              <CardComponent product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

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
  return (
    prev.product.id === next.product.id &&
    prev.product.price.amount === next.product.price.amount
  );
});

const MemoizedCompactProductCard = memo(CompactProductCard, (prev, next) => {
  return (
    prev.product.id === next.product.id &&
    prev.product.price.amount === next.product.price.amount
  );
});

const MemoizedListProductCard = memo(ListProductCard, (prev, next) => {
  return (
    prev.product.id === next.product.id &&
    prev.product.price.amount === next.product.price.amount
  );
});
