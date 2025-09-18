"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { usePrefetch } from "@/hooks/usePrefetch";
import { cn } from "@/lib/utils";

interface OptimizedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  prefetchDelay?: number;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  locale?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const OptimizedLink = forwardRef<HTMLAnchorElement, OptimizedLinkProps>(
  (
    {
      href,
      children,
      className,
      prefetch = true,
      prefetchDelay = 100,
      replace = false,
      scroll = true,
      shallow = false,
      locale,
      onClick,
      ...props
    },
    ref
  ) => {
    const { handleMouseEnter, handleMouseLeave } = usePrefetch({
      delay: prefetchDelay,
    });

    const handleMouseEnterLink = () => {
      if (prefetch) {
        handleMouseEnter(href);
      }
    };

    const handleMouseLeaveLink = () => {
      if (prefetch) {
        handleMouseLeave();
      }
    };

    return (
      <Link
        ref={ref}
        href={href}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        locale={locale}
        prefetch={false} // Отключаем автоматический prefetch Next.js
        className={cn(className)}
        onMouseEnter={handleMouseEnterLink}
        onMouseLeave={handleMouseLeaveLink}
        onClick={onClick}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

OptimizedLink.displayName = "OptimizedLink";

export default OptimizedLink;