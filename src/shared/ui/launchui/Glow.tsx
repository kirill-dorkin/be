import { cva, VariantProps } from "class-variance-authority";
import React from "react";

import { cn } from "@/shared/lib/utils";

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
          "from-blue-500/30 to-transparent absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2] rounded-full bg-radial-gradient opacity-10 sm:h-[384px] dark:opacity-20",
          variant === "center" && "-translate-y-1/2",
        )}
        style={{
          background: "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%)"
        }}
      />
    </div>
  );
}
