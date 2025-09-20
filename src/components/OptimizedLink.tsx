"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface OptimizedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  priority?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function OptimizedLink({
  href,
  children,
  className,
  prefetch = true,
  priority = false,
  onMouseEnter,
  onMouseLeave,
  ...props
}: OptimizedLinkProps) {
  const router = useRouter();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [isPrefetched, setIsPrefetched] = useState(false);

  // Intersection Observer для предзагрузки при появлении в viewport
  useEffect(() => {
    if (!prefetch || isPrefetched) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Предзагружаем страницу при появлении в viewport
            router.prefetch(href);
            setIsPrefetched(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Предзагружаем за 200px до появления
        threshold: 0.1,
      }
    );

    if (linkRef.current) {
      observer.observe(linkRef.current);
    }

    return () => observer.disconnect();
  }, [href, prefetch, isPrefetched, router]);

  // Предзагрузка при hover для мгновенного перехода
  const handleMouseEnter = () => {
    if (!isPrefetched) {
      router.prefetch(href);
      setIsPrefetched(true);
    }
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    onMouseLeave?.();
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      className={className}
      prefetch={priority}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Link>
  );
}

export default OptimizedLink;