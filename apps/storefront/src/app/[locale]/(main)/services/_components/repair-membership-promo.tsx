"use client";

import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";

import { MEMBERSHIP_CONFIG } from "@nimara/domain/membership/constants";
import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

type RepairMembershipPromoProps = {
  estimatedCost: number;
  formattedSavings: string;
};

export const RepairMembershipPromo = ({
  estimatedCost,
  formattedSavings,
}: RepairMembershipPromoProps) => {
  const t = useTranslations("services");

  if (estimatedCost === 0) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-yellow-950/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              {t("calculator.membershipPromo.title")}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-200">
              {t("calculator.membershipPromo.subtitle", {
                amount: formattedSavings,
              })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {formattedSavings}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-200">
            {t("calculator.membershipPromo.savingsLabel", {
              percent: MEMBERSHIP_CONFIG.REPAIR_DISCOUNT_PERCENT,
            })}
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
          {t("calculator.membershipPromo.cta")}
        </LocalizedLink>
      </Button>
    </div>
  );
};
