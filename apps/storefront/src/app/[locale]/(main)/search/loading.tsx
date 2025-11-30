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
        <div className="bg-muted/50 mb-4 h-4 w-32 animate-pulse rounded" />

        <div className="border-border/40 flex items-center justify-between border-b pb-4 pt-1">
          {/* Title skeleton */}
          <div className="bg-muted/50 h-8 w-64 animate-pulse rounded" />

          <div className="flex gap-3">
            {/* ViewToggle skeleton */}
            <div className="bg-muted/50 h-10 w-28 animate-pulse rounded-lg" />

            <div className="flex gap-4">
              {/* Sort skeleton */}
              <div className="bg-muted/50 hidden h-10 w-32 animate-pulse rounded-lg md:block" />
              {/* Filter skeleton */}
              <div className="bg-muted/50 h-10 w-10 animate-pulse rounded-xl sm:w-28" />
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto mt-8 grid gap-8">
        <ProductsSkeleton
          viewMode={mounted ? viewMode : "compact"}
          count={16}
        />
      </section>
    </div>
  );
}
