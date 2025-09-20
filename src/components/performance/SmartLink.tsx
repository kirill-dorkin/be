'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useRef, useCallback, MouseEvent, ComponentProps } from 'react';
import { useIntelligentPreloader } from './IntelligentPreloader';

interface SmartLinkProps extends Omit<ComponentProps<typeof Link>, 'href' | 'onClick'> {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  priority?: 'high' | 'low';
  preloadOnHover?: boolean;
  preloadOnVisible?: boolean;
  hoverDelay?: number;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export default function SmartLink({
  href,
  children,
  className,
  prefetch = true,
  priority = 'low',
  preloadOnHover = true,
  preloadOnVisible = false,
  hoverDelay = 100,
  onClick,
  ...props
}: SmartLinkProps) {
  const router = useRouter();
  const { preloadRoute, observeElement } = useIntelligentPreloader();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasPreloadedRef = useRef(false);

  // Preload function
  const handlePreload = useCallback(() => {
    if (hasPreloadedRef.current) return;
    
    hasPreloadedRef.current = true;
    
    // Use Next.js prefetch for high priority
    if (priority === 'high') {
      router.prefetch(href);
    } else {
      // Use intelligent preloader for low priority
      preloadRoute(href);
    }
  }, [href, priority, router, preloadRoute]);

  // Handle hover preloading
  const handleMouseEnter = useCallback(() => {
    if (!preloadOnHover) return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      handlePreload();
    }, hoverDelay);
  }, [preloadOnHover, hoverDelay, handlePreload]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  // Handle visibility-based preloading
  useEffect(() => {
    if (!preloadOnVisible || !linkRef.current) return;

    observeElement(linkRef.current);
  }, [preloadOnVisible, observeElement]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Handle click analytics
  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    // Track navigation performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigationStart = performance.now();
      
      // Store navigation start time for measuring
      sessionStorage.setItem(`nav_start_${href}`, navigationStart.toString());
    }

    onClick?.(e);
  }, [href, onClick]);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={className}
      prefetch={prefetch && priority === 'high'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      data-preload={preloadOnVisible ? 'true' : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}

// Hook for measuring navigation performance
export function useNavigationPerformance() {
  const measureNavigation = useCallback((href: string) => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return null;
    }

    const startTime = sessionStorage.getItem(`nav_start_${href}`);
    if (!startTime) return null;

    const endTime = performance.now();
    const duration = endTime - parseFloat(startTime);

    // Clean up
    sessionStorage.removeItem(`nav_start_${href}`);

    return {
      href,
      duration,
      startTime: parseFloat(startTime),
      endTime
    };
  }, []);

  return { measureNavigation };
}