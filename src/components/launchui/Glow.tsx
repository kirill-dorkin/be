import { cva, VariantProps } from "class-variance-authority";
import React from "react";

import { cn } from "@/lib/utils";

const glowVariants = cva("absolute w-full", {
  variants: {
    variant: {
      top: "top-0",
      above: "-top-[128px]",
      bottom: "bottom-0",
      below: "-bottom-[128px]",
      center: "top-[50%]",
    },
  },
  defaultVariants: {
    variant: "top",
  },
});

export interface GlowProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof glowVariants> {}

export default function Glow({ className, variant, ...props }: GlowProps) {
  return (
    <div
      data-slot="glow"
      className={cn(glowVariants({ variant }), className)}
      {...props}
    >
      <div
        className={cn(
          "from-brand-foreground/50 to-transparent absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] opacity-20 sm:h-[512px] dark:opacity-100",
          variant === "center" && "-translate-y-1/2",
        )}
      />
      <div
        className={cn(
          "from-brand/30 to-transparent absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-200 rounded-[50%] bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] opacity-20 sm:h-[256px] dark:opacity-100",
          variant === "center" && "-translate-y-1/2",
        )}
      />
    </div>
  );
}
