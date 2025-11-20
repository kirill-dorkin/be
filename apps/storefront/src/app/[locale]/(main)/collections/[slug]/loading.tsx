"use client";

import { useEffect, useState } from "react";

import { type ViewMode } from "@/components/view-toggle";
import { getViewModeSync } from "@/lib/view-mode-storage";

import { ProductsSkeleton } from "../../search/_components/products-skeleton";

export default function Loading() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("compact");

  useEffect(() => {
    setMounted(true);
    setViewMode(getViewModeSync());
  }, []);

  return (
    <div className="mb-8 w-full">
      {/* Breadcrumbs skeleton */}
      <div className="mb-4 h-4 w-32 animate-pulse rounded bg-muted/50" />

      {/* Title skeleton */}
      <div className="mt-8 flex justify-center">
        <div className="h-8 w-48 animate-pulse rounded bg-muted/50" />
      </div>

      {/* Image skeleton */}
      <div className="relative mx-auto mt-8 aspect-[4/3] w-full max-w-2xl animate-pulse rounded-2xl border border-border/60 bg-muted/50 dark:border-white/10" />

      {/* Description skeleton */}
      <div className="mx-auto mt-8 max-w-2xl space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-muted/50" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted/50" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-muted/50" />
      </div>

      <hr className="my-8" />

      {/* Products header with toggle skeleton */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted/50" />
        <div className="h-10 w-28 animate-pulse rounded-lg bg-muted/50" />
      </div>

      {/* Products skeleton */}
      <section className="mx-auto mt-8 grid gap-8">
        <ProductsSkeleton viewMode={mounted ? viewMode : "compact"} count={12} />
      </section>
    </div>
  );
}
