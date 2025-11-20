"use client";

import { useEffect, useState } from "react";

import { type ViewMode } from "@/components/view-toggle";
import { getViewModeSync } from "@/lib/view-mode-storage";

import { ProductsSkeleton } from "./products-skeleton";

export function ProductsSkeletonWrapper() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("compact");

  useEffect(() => {
    setMounted(true);
    setViewMode(getViewModeSync());
  }, []);

  return <ProductsSkeleton viewMode={mounted ? viewMode : "compact"} />;
}
