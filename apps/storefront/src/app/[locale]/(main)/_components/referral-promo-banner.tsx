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
  const referralData = referralResult.ok
    ? referralResult.data?.referralData
    : null;

  // Don't show if no referral data
  if (!referralData) {
    return null;
  }

  // Show different content based on whether user has referred anyone
  const hasReferrals = (referralData.referralCount || 0) > 0;

  return (
    <div className="border-border/60 bg-card/70 rounded-3xl border p-8 shadow-sm sm:p-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            <Gift className="h-4 w-4" />
            {referralT("title")}
          </div>

          <div>
            <h2 className="text-foreground mb-3 text-2xl font-bold sm:text-3xl">
              {hasReferrals
                ? referralT("promo-title-active")
                : referralT("promo-title")}
            </h2>
            <p className="text-muted-foreground text-base">
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
            <Button
              asChild
              size="lg"
              className="gap-2 bg-amber-500 text-white shadow-sm hover:bg-amber-600"
            >
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="border-border/60 bg-card/70 rounded-2xl border p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <div className="text-foreground text-3xl font-bold">
              {referralData.vipReferralCount || 0}
            </div>
            <div className="text-muted-foreground text-sm">
              {referralT("vip-referrals")}
            </div>
          </div>

          <div className="border-border/60 bg-card/70 rounded-2xl border p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <Wallet className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-foreground text-3xl font-bold">
              {referralData.totalEarned || 0} {commonT("currency")}
            </div>
            <div className="text-muted-foreground text-sm">
              {referralT("total-earned")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
