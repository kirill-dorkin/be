"use client";

import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import { type User } from "@nimara/domain/objects/User";
import { MEMBERSHIP_CONFIG } from "@nimara/domain/membership/constants";
import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { useLocalizedFormatter } from "@/lib/formatters/use-localized-formatter";
import { paths } from "@/lib/paths";

type MembershipSavingsProps = {
  cart: Cart;
  user: User | null;
};

export const MembershipSavings = ({ cart, user }: MembershipSavingsProps) => {
  const t = useTranslations();
  const formatter = useLocalizedFormatter();

  const isMember = !!user; // TODO: Check actual membership status

  // Calculate total membership savings
  const savings = useMemo(() => {
    const productTotal = cart.subtotal.amount;
    const savingsAmount = productTotal * (MEMBERSHIP_CONFIG.PRODUCT_DISCOUNT_PERCENT / 100);

    return savingsAmount;
  }, [cart.subtotal.amount]);

  if (savings === 0) {
    return null;
  }

  const formattedSavings = formatter.price({ amount: savings });

  if (isMember) {
    return (
      <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-yellow-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                {t("cart.membership.member-title")}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-200">
                {t("cart.membership.member-subtitle")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              -{formattedSavings}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-200">
              {MEMBERSHIP_CONFIG.PRODUCT_DISCOUNT_PERCENT}% {t("cart.membership.discount")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // For guests, show promotional message
  return (
    <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-yellow-950/20">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                {t("cart.membership.guest-title")}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-200">
                {t("cart.membership.guest-subtitle", { amount: formattedSavings })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {formattedSavings}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-200">
              {t("cart.membership.potential-savings")}
            </p>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:from-amber-600 hover:to-yellow-700"
        >
          <LocalizedLink href={paths.membership.asPath()}>
            <Crown className="mr-2 h-3.5 w-3.5" />
            {t("cart.membership.join-cta")}
          </LocalizedLink>
        </Button>
      </div>
    </div>
  );
};
