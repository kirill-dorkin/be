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
      <div className="flex w-full max-w-md flex-col items-center">
        {/* Icon container */}
        <div className="border-border/60 bg-muted/30 mb-6 flex h-24 w-24 items-center justify-center rounded-full border sm:mb-8 sm:h-28 sm:w-28">
          <ShoppingBag
            className="text-muted-foreground h-10 w-10 sm:h-12 sm:w-12"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>

        {/* Text content */}
        <div className="mb-6 flex flex-col items-center gap-2.5 text-center sm:mb-8 sm:gap-3">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            {t("cart.empty")}
          </h1>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed sm:text-base md:text-lg">
            {t("site.check-out-our-store")}
          </p>
        </div>

        {/* CTA Button */}
        <LocalizedLink
          href={paths.search.asPath()}
          className="w-full sm:w-auto"
        >
          <Button size="lg" className="w-full min-w-[200px] sm:w-auto">
            {t("site.explore-our-store")}
          </Button>
        </LocalizedLink>

        {/* Additional links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm sm:mt-8">
          <LocalizedLink
            href={paths.home.asPath()}
            className="text-muted-foreground hover:text-foreground underline-offset-4 transition-colors hover:underline"
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
