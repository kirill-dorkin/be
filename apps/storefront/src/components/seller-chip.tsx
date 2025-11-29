"use client";

import { User } from "lucide-react";

import { cn } from "@/lib/utils";

type SellerChipProps = {
  name: string;
  className?: string;
};

export const SellerChip = ({ name, className }: SellerChipProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-sm text-muted-foreground ring-1 ring-border/60",
        className,
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
        <User className="h-4 w-4" />
      </span>
      {name}
    </div>
  );
};
