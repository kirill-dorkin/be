import { Sparkles, TrendingUp, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@nimara/ui/components/card";

import { REFERRAL_BONUS_AMOUNT } from "@/lib/referral/types";

export function ReferralEmptyState() {
  const t = useTranslations();

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
          <Users className="h-10 w-10 text-violet-600 dark:text-violet-400" />
        </div>

        <h3 className="dark:text-primary mb-2 text-2xl font-bold text-slate-900">
          {t("referral.empty-title")}
        </h3>

        <p className="dark:text-muted-foreground mb-8 max-w-md text-base text-slate-600">
          {t("referral.empty-description", {
            amount: REFERRAL_BONUS_AMOUNT,
            currency: t("common.currency"),
          })}
        </p>

        <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="dark:text-primary mb-1 text-sm font-semibold text-slate-900">
              {t("referral.empty-step-1-title")}
            </h4>
            <p className="dark:text-muted-foreground text-xs text-slate-600">
              {t("referral.empty-step-1-desc")}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="dark:text-primary mb-1 text-sm font-semibold text-slate-900">
              {t("referral.empty-step-2-title")}
            </h4>
            <p className="dark:text-muted-foreground text-xs text-slate-600">
              {t("referral.empty-step-2-desc")}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="dark:text-primary mb-1 text-sm font-semibold text-slate-900">
              {t("referral.empty-step-3-title")}
            </h4>
            <p className="dark:text-muted-foreground text-xs text-slate-600">
              {t("referral.empty-step-3-desc", {
                amount: REFERRAL_BONUS_AMOUNT,
                currency: t("common.currency"),
              })}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 p-4 dark:from-violet-950/30 dark:to-purple-950/30">
          <p className="text-sm font-medium text-violet-900 dark:text-violet-300">
            💡 {t("referral.empty-tip")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
