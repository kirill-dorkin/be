"use client";

import { ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type ProductMediaEmptyStateProps = {
  className?: string;
  productName: string;
};

export const ProductMediaEmptyState = ({
  productName,
  className,
}: ProductMediaEmptyStateProps) => {
  const t = useTranslations("products");

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/20 p-6 text-center md:p-10 min-h-[260px] md:min-h-[420px]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,theme(colors.primary/40),transparent_55%),radial-gradient(circle_at_bottom_right,theme(colors.secondary/45),transparent_55%)] opacity-60"
      />

      <div className="relative flex flex-col items-center justify-center gap-4">
        <span className="bg-background/80 text-primary flex h-16 w-16 items-center justify-center rounded-full border border-white/20 shadow-xl backdrop-blur-md">
          <ImageOff className="h-8 w-8" aria-hidden />
        </span>

        <div className="max-w-md space-y-2">
          <p className="text-lg font-semibold text-foreground">
            {t("media-placeholder-title")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("media-placeholder-description", { productName })}
          </p>
        </div>

        <p className="text-xs text-muted-foreground/80">
          {t("media-placeholder-hint")}
        </p>
      </div>
    </div>
  );
};
