"use client";

import { useEffect, useState } from "react";

import { type ViewMode } from "@/components/view-toggle";
import { getViewModeSync } from "@/lib/view-mode-storage";

import { ProductsSkeleton } from "./_components/products-skeleton";

export default function Loading() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("compact");

  useEffect(() => {
    setMounted(true);
    setViewMode(getViewModeSync());
  }, []);

  return (
    <div className="w-full">
      <div className="bg-background sticky top-20 z-40 mt-8 pt-2 md:static md:mt-8 md:pt-0">
        {/* Breadcrumbs skeleton */}
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-muted/50" />

        <div className="flex items-center justify-between border-b border-border/40 pb-4 pt-1">
          {/* Title skeleton */}
          <div className="h-8 w-64 animate-pulse rounded bg-muted/50" />

          <div className="flex gap-3">
            {/* ViewToggle skeleton */}
            <div className="h-10 w-28 animate-pulse rounded-lg bg-muted/50" />

            <div className="flex gap-4">
              {/* Sort skeleton */}
              <div className="hidden h-10 w-32 animate-pulse rounded-lg bg-muted/50 md:block" />
              {/* Filter skeleton */}
              <div className="h-10 w-10 animate-pulse rounded-xl bg-muted/50 sm:w-28" />
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto mt-8 grid gap-8">
        <ProductsSkeleton viewMode={mounted ? viewMode : "compact"} count={16} />
      </section>
    </div>
  );
}
