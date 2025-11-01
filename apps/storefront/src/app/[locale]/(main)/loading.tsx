import { ProductsGridSkeleton } from "./_components/products-grid";

export default function Loading() {
  return (
    <section className="grid w-full content-start">
      {/* Hero Banner Skeleton */}
      <div className="mb-8 h-[400px] w-full animate-pulse bg-gray-200 dark:bg-gray-700" />

      {/* Repair Discount Banner Skeleton */}
      <div className="mb-8 h-24 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />

      {/* Products Grid Skeleton */}
      <ProductsGridSkeleton />
    </section>
  );
}
