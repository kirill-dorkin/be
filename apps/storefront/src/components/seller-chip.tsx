"use client";

import { User } from "lucide-react";

import { cn } from "@/lib/utils";

type SellerChipProps = {
  className?: string;
  href?: string;
  name: string;
};

export const SellerChip = ({ name, className, href }: SellerChipProps) => {
  const content = (
    <div
      className={cn(
        "border-border/60 bg-card/70 text-muted-foreground ring-border/60 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ring-1",
        className,
      )}
    >
      <span className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-full">
        <User className="h-4 w-4" />
      </span>
      {name}
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
