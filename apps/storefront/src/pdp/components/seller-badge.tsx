"use client";

import { User } from "lucide-react";

import { cn } from "@/lib/utils";

type SellerBadgeProps = {
  className?: string;
  name?: string;
  href?: string;
};

export const SellerBadge = ({
  className,
  name = "BestElectronics",
  href,
}: SellerBadgeProps) => {
  const content = (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-2 text-sm font-medium text-foreground shadow-sm",
        className,
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
        <User className="h-4 w-4" />
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Продавец
        </span>
        <span>{name}</span>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="inline-flex" aria-label={`Продавец: ${name}`}>
        {content}
      </a>
    );
  }

  return content;
};
