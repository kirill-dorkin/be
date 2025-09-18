"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

interface UsePrefetchOptions {
  delay?: number;
  priority?: boolean;
}

export function usePrefetch(options: UsePrefetchOptions = {}) {
  const router = useRouter();
  const { delay = 100, priority = false } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prefetch = useCallback(
    (href: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        try {
          router.prefetch(href);
        } catch (error) {
          console.warn("Prefetch failed:", error);
        }
      }, delay);
    },
    [router, delay, priority]
  );

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(
    (href: string) => {
      prefetch(href);
    },
    [prefetch]
  );

  const handleMouseLeave = useCallback(() => {
    cancelPrefetch();
  }, [cancelPrefetch]);

  return {
    prefetch,
    cancelPrefetch,
    handleMouseEnter,
    handleMouseLeave,
  };
}

export default usePrefetch;