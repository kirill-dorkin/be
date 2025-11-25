import { Gift, LinkIcon, Sparkles, TrendingUp, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { type ReactNode } from "react";

import { Button } from "@nimara/ui/components/button";

import { getAccessToken } from "@/auth";
import { LocalizedLink } from "@/i18n/routing";
import { getReferralData } from "@/lib/actions/referral";
import { paths } from "@/lib/paths";
import { REFERRAL_BONUS_AMOUNT } from "@/lib/referral/types";
import { calculateBalance } from "@/lib/referral/utils";

import { ReferralEmptyState } from "./_components/empty-state";
import { ReferralLinkCard } from "./_components/referral-link-card";

export default async function ReferralPage() {
  const [accessToken, t] = await Promise.all([
    getAccessToken(),
    getTranslations(),
  ]);

  if (!accessToken) {
    redirect(paths.signIn.asPath());
  }

  const referralResult = await getReferralData();

  if (!referralResult.ok || !referralResult.data) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
        {t("referral.no-data-description")}
      </div>
    );
  }

  const { referralData, balance } = referralResult.data;

  if (!referralData || !referralData.referralCode) {
    return (
      <div className="rounded-3xl border border-slate-100/80 bg-white/90 p-6 text-center text-sm text-slate-500 shadow-sm ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900/40 dark:text-muted-foreground dark:ring-white/5">
        {t("referral.no-data-description")}
      </div>
    );
  }

  const referralLink = `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/create-account?ref=${referralData.referralCode}`;
  const totalReferrals = referralData.referralCount || 0;
  const vipReferrals = referralData.vipReferralCount || 0;
  const lifetimeEarned = referralData.totalEarned || 0;
  const availableBalance = calculateBalance(balance.transactions);

  const howItWorksSteps = [
    {
      icon: <Sparkles className="h-5 w-5 text-blue-600" />,
      badgeClass: "bg-blue-100",
      title: t("referral.step-1-title"),
      description: t("referral.step-1-description"),
    },
    {
      icon: <Users className="h-5 w-5 text-emerald-600" />,
      badgeClass: "bg-emerald-100",
      title: t("referral.step-2-title"),
      description: t("referral.step-2-description"),
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-amber-600" />,
      badgeClass: "bg-amber-100",
      title: t("referral.step-3-title"),
      description: t("referral.step-3-description", {
        amount: REFERRAL_BONUS_AMOUNT,
        currency: balance.currency,
      }),
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-sm md:gap-8">
      <section className="rounded-3xl border border-slate-100/80 bg-gradient-to-br from-white to-slate-50/60 p-6 shadow-sm ring-1 ring-black/5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/60 dark:ring-white/5">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground">
            {t("referral.title")}
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-primary">
            {t("referral.subtitle")}
          </h1>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={<Users className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />}
            label={t("referral.total-referrals")}
            value={totalReferrals}
          />
          <StatsCard
            icon={<Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />}
            label={t("referral.vip-referrals")}
            value={vipReferrals}
          />
          <StatsCard
            icon={<TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-300" />}
            label={t("referral.total-earned")}
            value={`${lifetimeEarned} ${balance.currency}`}
          />
          <StatsCard
            icon={<LinkIcon className="h-5 w-5 text-violet-600 dark:text-violet-300" />}
            label={t("balance.available-balance")}
            value={`${availableBalance.toFixed(2)} ${balance.currency}`}
          />
        </div>
      </section>

      <ReferralLinkCard
        referralLink={referralLink}
        referralCode={referralData.referralCode}
      />

      {totalReferrals === 0 ? (
        <ReferralEmptyState />
      ) : (
        <section className="rounded-3xl border border-slate-100/80 bg-white/90 p-6 shadow-sm ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900/40 dark:ring-white/5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-primary">
                {t("referral.promo-title-active")}
              </h2>
              <p className="text-sm text-slate-500 dark:text-muted-foreground">
                {t("referral.promo-description-active", {
                  count: vipReferrals,
                  amount: lifetimeEarned,
                  currency: balance.currency,
                })}
              </p>
            </div>
            <Button asChild variant="outline">
              <LocalizedLink href={paths.account.balance.asPath()}>
                {t("balance.title")}
              </LocalizedLink>
            </Button>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-slate-100/80 bg-white/90 p-6 shadow-sm ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900/40 dark:ring-white/5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-primary">
          {t("referral.how-it-works")}
        </h2>
        <ol className="space-y-3">
          {howItWorksSteps.map((step, index) => (
            <Step
              key={step.title}
              description={step.description}
              icon={step.icon}
              index={index + 1}
              badgeClass={step.badgeClass}
              title={step.title}
            />
          ))}
        </ol>
      </section>
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100/70 bg-white/80 p-4 shadow-inner dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900/80">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-primary">
        {value}
      </p>
    </div>
  );
}

function Step({
  badgeClass,
  description,
  icon,
  index,
  title,
}: {
  badgeClass: string;
  description: string;
  icon: ReactNode;
  index: number;
  title: string;
}) {
  return (
    <li className="flex items-center gap-3 rounded-[28px] border border-slate-100/80 bg-white/80 p-4 shadow-inner dark:border-slate-800/70 dark:bg-slate-900/30">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${badgeClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground">
          {index.toString().padStart(2, "0")}
        </p>
        <p className="text-base font-semibold text-slate-900 dark:text-primary">
          {title}
        </p>
        <p className="text-sm text-slate-500 dark:text-muted-foreground">
          {description}
        </p>
      </div>
    </li>
  );
}
