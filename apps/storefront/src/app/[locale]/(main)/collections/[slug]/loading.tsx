import { Skeleton } from "@nimara/ui/components/skeleton";

import { DEFAULT_RESULTS_PER_PAGE } from "@/config";

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      {/* Collection Header Skeleton */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filters and Sort Skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {Array(DEFAULT_RESULTS_PER_PAGE)
          .fill(null)
          .map((_, idx) => (
            <Skeleton key={idx} className="aspect-square w-full" />
          ))}
      </div>
    </div>
  );
}
