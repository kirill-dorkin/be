import { Skeleton } from "@nimara/ui/components/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items Skeleton */}
        <div className="lg:col-span-2">
          <Skeleton className="mb-4 h-8 w-32" />
          <div className="space-y-4">
            {Array(3)
              .fill(null)
              .map((_, idx) => (
                <div key={idx} className="flex gap-4">
                  <Skeleton className="h-24 w-24" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Order Summary Skeleton */}
        <div className="lg:col-span-1">
          <Skeleton className="mb-4 h-8 w-40" />
          <div className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-4 h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
