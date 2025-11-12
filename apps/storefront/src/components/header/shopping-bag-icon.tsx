"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, type PropsWithChildren } from "react";

import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

interface ShoppingBagIconProps extends PropsWithChildren {
  count?: number;
}

const ShoppingBagIconComponent = ({
  children,
  count = 0,
}: ShoppingBagIconProps) => {
  const t = useTranslations("cart");

  return (
    <Button variant="ghost" size="icon" className="relative gap-1" asChild>
      <LocalizedLink
        href={paths.cart.asPath()}
        aria-label={t("items-in-cart", { cartItems: count })}
      >
        <ShoppingBag className="h-4 w-4" />
        {children}
      </LocalizedLink>
    </Button>
  );
};

// Мемоизация - используется в header на каждой странице
export const ShoppingBagIcon = memo(ShoppingBagIconComponent, (prevProps, nextProps) => {
  return prevProps.count === nextProps.count;
});
