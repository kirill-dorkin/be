"use client";

import { type ViewMode } from "@/components/view-toggle";

type ProductsSkeletonProps = {
  count?: number;
  viewMode?: ViewMode;
};

export function ProductsSkeleton({
  count = 16,
  viewMode = "compact",
}: ProductsSkeletonProps) {
  const gridClassName = (() => {
    switch (viewMode) {
      case "compact":
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4";
      case "list":
        return "flex flex-col gap-3 md:gap-4";
      case "grid":
      default:
        return "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4";
    }
  })();

  return (
    <div className={gridClassName} role="status" aria-label="Loading products">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} viewMode={viewMode} />
      ))}
    </div>
  );
}

// Shimmer effect component
const Shimmer = () => (
  <div className="animate-shimmer absolute inset-0">
    <div className="h-full w-full bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />
  </div>
);

type ProductCardSkeletonProps = {
  viewMode: ViewMode;
};

function ProductCardSkeleton({ viewMode }: ProductCardSkeletonProps) {
  if (viewMode === "list") {
    return (
      <div className="border-border/60 bg-card dark:bg-card/80 rounded-xl border p-3 shadow-sm md:p-4 dark:border-white/10 dark:shadow-[0_8px_24px_rgba(15,23,42,0.22)]">
        <div className="flex gap-4 md:gap-6">
          {/* Image skeleton */}
          <div className="relative w-24 shrink-0 md:w-32">
            <div className="border-border/60 bg-muted/50 dark:bg-muted/70 aspect-square overflow-hidden rounded-lg border p-2 dark:border-white/10">
              <div className="relative h-full w-full overflow-hidden">
                <div className="bg-muted/30 h-full w-full animate-pulse" />
                <Shimmer />
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="flex flex-1 flex-col justify-between gap-2 py-1">
            <div>
              {/* Title skeleton - 2 lines */}
              <div className="relative mb-2 h-5 w-full overflow-hidden rounded">
                <div className="bg-muted/50 dark:bg-muted/70 h-full w-full animate-pulse" />
                <Shimmer />
              </div>
              <div className="relative h-5 w-3/4 overflow-hidden rounded">
                <div className="bg-muted/50 dark:bg-muted/70 h-full w-full animate-pulse" />
                <Shimmer />
              </div>
            </div>
            {/* Price skeleton */}
            <div className="flex items-center justify-between">
              <div className="relative h-6 w-24 overflow-hidden rounded md:h-7 md:w-28">
                <div className="bg-muted/50 dark:bg-muted/70 h-full w-full animate-pulse" />
                <Shimmer />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "compact") {
    return (
      <div>
        <div className="grid gap-1.5">
          {/* Image skeleton */}
          <div className="border-border/60 bg-muted/50 dark:bg-muted/70 relative aspect-square overflow-hidden rounded-xl border p-2 shadow-sm dark:border-white/10 dark:shadow-[0_8px_24px_rgba(15,23,42,0.22)]">
            <div className="relative h-full w-full overflow-hidden">
              <div className="bg-muted/30 h-full w-full animate-pulse" />
              <Shimmer />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="px-0.5">
            {/* Title skeleton - 2 lines */}
            <div className="relative mb-1.5 h-4 w-full overflow-hidden rounded">
              <div className="bg-muted/50 dark:bg-muted/70 h-full w-full animate-pulse" />
              <Shimmer />
            </div>
            <div className="relative mb-2 h-4 w-2/3 overflow-hidden rounded">
              <div className="bg-muted/50 dark:bg-muted/70 h-full w-full animate-pulse" />
              <Shimmer />
            </div>
            {/* Price skeleton */}
            <div className="relative h-4 w-20 overflow-hidden rounded">
              <div className="bg-muted/50 dark:bg-muted/70 h-full w-full animate-pulse" />
              <Shimmer />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // grid view
  return (
    <div className="row-span-3">
      <div className="grid gap-2">
        {/* Image skeleton */}
        <div className="border-border/60 bg-muted/50 dark:bg-muted/70 relative aspect-square overflow-hidden rounded-2xl border p-3 shadow-sm dark:border-white/10 dark:shadow-[0_12px_32px_rgba(15,23,42,0.28)]">
          <div className="relative h-full w-full overflow-hidden">
            <div className="bg-muted/30 h-full w-full animate-pulse" />
            <Shimmer />
          </div>
        </div>

        {/* Content skeleton */}
        <div>
          {/* Title skeleton - 1 line */}
          <div className="relative mb-2 h-5 w-3/4 overflow-hidden rounded">
            <div className="bg-muted/50 dark:bg-muted/70 h-full w-full animate-pulse" />
            <Shimmer />
          </div>
          {/* Price skeleton */}
          <div className="relative h-5 w-24 overflow-hidden rounded">
            <div className="bg-muted/50 dark:bg-muted/70 h-full w-full animate-pulse" />
            <Shimmer />
          </div>
        </div>
      </div>
    </div>
  );
}
