"use client";

import Image from "next/image";
import { cn } from "@/shared/lib/utils";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
}

const FALLBACK_SRC = "/images/placeholders/product-placeholder.svg";

export function ProductImage({ src, alt, className, priority = false, sizes = "100vw", fill = true }: ProductImageProps) {
  const source = src && src.trim().length > 0 ? src : FALLBACK_SRC;

  if (fill) {
    return (
      <Image
        src={source}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={source}
      alt={alt}
      width={480}
      height={360}
      priority={priority}
      sizes={sizes}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
