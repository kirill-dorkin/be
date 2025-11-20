"use client";

import { Suspense } from "react";

import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";

import { ProductsList } from "@/app/[locale]/(main)/_components/products-list";

import { ProductsSkeletonWrapper } from "./products-skeleton-wrapper";
import { useViewMode } from "./search-header";

type ProductsListWithModeProps = {
  products: SearchProduct[];
};

export function ProductsListWithMode({ products }: ProductsListWithModeProps) {
  const { viewMode } = useViewMode();

  return (
    <Suspense fallback={<ProductsSkeletonWrapper />}>
      <ProductsList products={products} viewMode={viewMode} />
    </Suspense>
  );
}
