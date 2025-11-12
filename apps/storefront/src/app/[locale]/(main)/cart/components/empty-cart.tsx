"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

const EmptyCartComponent = () => {
  const t = useTranslations();

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4 py-12 md:py-16">
      <div className="relative flex w-full max-w-md flex-col items-center">
        {/* Decorative background gradient */}
        <div
          className="pointer-events-none absolute inset-0 -top-20 opacity-30 blur-3xl"
          aria-hidden
        >
          <div className="bg-primary/30 absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        </div>

        {/* Icon container with gradient background */}
        <div className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-full border-2 border-border/60 bg-gradient-to-br from-muted/40 via-background to-muted/30 shadow-lg dark:border-white/10 dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="bg-muted/50 absolute inset-3 rounded-full" />
          <ShoppingBag
            className="text-muted-foreground relative z-10 h-12 w-12"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>

        {/* Text content */}
        <div className="relative mb-8 flex flex-col items-center gap-3 text-center">
          <h1 className="text-slate-700 dark:text-primary text-3xl font-semibold tracking-tight md:text-4xl">
            {t("cart.empty")}
          </h1>
          <p className="text-muted-foreground max-w-sm text-base leading-relaxed md:text-lg">
            {t("site.check-out-our-store")}
          </p>
        </div>

        {/* CTA Button */}
        <LocalizedLink href={paths.search.asPath()} className="relative w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full min-w-[200px] shadow-md transition-all hover:shadow-lg sm:w-auto"
          >
            {t("site.explore-our-store")}
          </Button>
        </LocalizedLink>

        {/* Optional: Additional links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
          <LocalizedLink
            href={paths.home.asPath()}
            className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            {t("home.home")}
          </LocalizedLink>
        </div>
      </div>
    </div>
  );
};

// Мемоизация - статичный компонент пустой корзины
export const EmptyCart = memo(EmptyCartComponent);
