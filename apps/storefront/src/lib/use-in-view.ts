"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseInViewOptions = IntersectionObserverInit & {
  once?: boolean;
};

export const useInView = <T extends Element>(options?: UseInViewOptions) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  const serializedOptions = useMemo(
    () =>
      JSON.stringify({
        root: undefined,
        rootMargin: options?.rootMargin ?? null,
        threshold: options?.threshold ?? 0,
        once: options?.once ?? false,
      }),
    [options?.once, options?.rootMargin, options?.threshold],
  );

  const ref = useCallback(
    (node: T | null) => {
      cleanupObserver();

      if (!node) {
        setIsIntersecting(false);

        return;
      }

      const parsedOptions = JSON.parse(serializedOptions) as {
        once: boolean;
        root: null;
        rootMargin: string | null;
        threshold: number;
      };

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          setIsIntersecting(entry.isIntersecting);

          if (entry.isIntersecting && parsedOptions.once) {
            cleanupObserver();
          }
        },
        {
          root: null,
          rootMargin: parsedOptions.rootMargin ?? undefined,
          threshold: parsedOptions.threshold,
        },
      );

      observerRef.current.observe(node);
    },
    [cleanupObserver, serializedOptions],
  );

  useEffect(() => cleanupObserver, [cleanupObserver]);

  return { ref, isIntersecting };
};
