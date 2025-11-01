import { Skeleton } from "@nimara/ui/components/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 md:grid-cols-[250px_1fr]">
        {/* Sidebar Skeleton */}
        <aside className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </aside>

        {/* Content Skeleton */}
        <main className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}
