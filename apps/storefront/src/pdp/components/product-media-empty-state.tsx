"use client";

import { ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

import { cn } from "@/lib/utils";

type ProductMediaEmptyStateProps = {
  className?: string;
  productName: string;
};

const ProductMediaEmptyStateComponent = ({
  productName,
  className,
}: ProductMediaEmptyStateProps) => {
  const t = useTranslations("products");

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/40 via-background to-muted/30 p-6 text-center shadow-sm md:p-12 min-h-[260px] md:min-h-[420px] max-w-full",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top_left,theme(colors.primary/45),transparent_55%),radial-gradient(circle_at_bottom_right,theme(colors.secondary/45),transparent_55%)] opacity-70"
      />

      <div className="relative flex w-full max-w-md flex-col items-center justify-center gap-5 px-2">
        <span className="bg-background/90 text-primary/90 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 shadow-lg backdrop-blur-md md:h-20 md:w-20">
          <ImageOff className="h-8 w-8" aria-hidden />
        </span>

        <div className="space-y-3 w-full">
          <p className="text-xl font-semibold text-foreground md:text-2xl">
            {t("media-placeholder-title")}
          </p>
          <p
            className="text-sm text-muted-foreground md:text-base break-words max-w-full"
            style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
          >
            {t("media-placeholder-description", { productName })}
          </p>
        </div>

        <p className="text-xs text-muted-foreground/80 md:text-sm">
          {t("media-placeholder-hint")}
        </p>
      </div>
    </div>
  );
};

// Мемоизация - пустое состояние для медиа товара
export const ProductMediaEmptyState = memo(ProductMediaEmptyStateComponent, (prevProps, nextProps) => {
  return (
    prevProps.productName === nextProps.productName &&
    prevProps.className === nextProps.className
  );
});
