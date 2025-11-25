import { ArrowRight, Gift, Users, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { getReferralData } from "@/lib/actions/referral";
import { paths } from "@/lib/paths";
import { REFERRAL_BONUS_AMOUNT } from "@/lib/referral/types";

interface ReferralPromoBannerProps {
  user: User | null;
}

export async function ReferralPromoBanner({ user }: ReferralPromoBannerProps) {
  const [referralT, commonT] = await Promise.all([
    getTranslations("referral"),
    getTranslations("common"),
  ]);

  // Don't show if user is not logged in
  if (!user) {
    return null;
  }

  // Get user's referral data
  const referralResult = await getReferralData();
  const referralData = referralResult.ok ? referralResult.data?.referralData : null;

  // Don't show if no referral data
  if (!referralData) {
    return null;
  }

  // Show different content based on whether user has referred anyone
  const hasReferrals = (referralData.referralCount || 0) > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-8 shadow-lg dark:border-slate-800 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-pink-950/30 sm:p-12">
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-900/20" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-200/30 blur-3xl dark:bg-purple-900/20" />

      <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left side - Info */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-violet-700 dark:bg-slate-900/60 dark:text-violet-400">
            <Gift className="h-4 w-4" />
            {referralT("title")}
          </div>

          <div>
            <h2 className="mb-3 text-3xl font-bold text-slate-900 dark:text-primary sm:text-4xl">
              {hasReferrals
                ? referralT("promo-title-active")
                : referralT("promo-title")}
            </h2>
            <p className="text-lg text-slate-600 dark:text-muted-foreground">
              {hasReferrals
                ? referralT("promo-description-active", {
                    count: referralData.vipReferralCount || 0,
                    amount: REFERRAL_BONUS_AMOUNT,
                    currency: commonT("currency"),
                  })
                : referralT("promo-description", {
                    amount: REFERRAL_BONUS_AMOUNT,
                    currency: commonT("currency"),
                  })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <LocalizedLink href={paths.account.referral.asPath()}>
                {hasReferrals
                  ? referralT("view-my-stats")
                  : referralT("get-started")}
                <ArrowRight className="h-4 w-4" />
              </LocalizedLink>
            </Button>
            {!hasReferrals && (
              <Button asChild variant="outline" size="lg" className="gap-2">
                <LocalizedLink href={paths.account.referral.asPath()}>
                  {referralT("how-it-works")}
                </LocalizedLink>
              </Button>
            )}
          </div>
        </div>

        {/* Right side - Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/60 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/60">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
              <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-primary">
              {referralData.vipReferralCount || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-muted-foreground">
              {referralT("vip-referrals")}
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/60">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-primary">
              {referralData.totalEarned || 0} {commonT("currency")}
            </div>
            <div className="text-sm text-slate-600 dark:text-muted-foreground">
              {referralT("total-earned")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
