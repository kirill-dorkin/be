import { Crown, Star,TrendingDown, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

type MembershipBannerProps = {
  user: User | null;
};

export const MembershipBanner = async ({
  user,
}: MembershipBannerProps) => {
  const t = await getTranslations("home.membershipBanner");

  const title = user ? t("titleMember") : t("titleGuest");
  const description = user ? t("descriptionMember") : t("descriptionGuest");
  const primaryCta = user ? t("primaryCtaMember") : t("primaryCtaGuest");
  const secondaryLabel = user ? t("secondaryMember") : t("secondaryGuest");
  const secondaryHref = user
    ? paths.account.profile.asPath()
    : paths.createAccount.asPath();

  return (
    <section className="w-full text-neutral-900 dark:text-white">
      <div className="relative mx-auto overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 shadow-[0_24px_80px_rgba(245,158,11,0.15)] dark:border-amber-800/30 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-orange-950/20 dark:shadow-[0_48px_120px_rgba(245,158,11,0.25)]">
        <div className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-amber-400/30 blur-3xl dark:bg-amber-500/30" />
        <div className="absolute -right-32 -top-12 hidden h-80 w-80 rounded-full bg-yellow-400/20 blur-3xl dark:bg-yellow-400/20 lg:block" />
        <div className="relative grid gap-10 p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:p-16">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-gradient-to-r from-amber-500 to-yellow-600 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white dark:border-amber-700">
              <Crown className="h-3.5 w-3.5" />
              {t("badge")}
            </span>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight hyphens-auto break-words sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="text-sm text-neutral-700 hyphens-auto break-words sm:text-base dark:text-white/80">
              {description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:from-amber-600 hover:to-yellow-700 shadow-lg shadow-amber-500/30"
              >
                <LocalizedLink href={paths.membership.asPath()}>
                  <Crown className="mr-2 h-4 w-4" />
                  {primaryCta}
                </LocalizedLink>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="border border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200/60 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-100 dark:hover:bg-amber-900/50"
              >
                <LocalizedLink href={secondaryHref}>
                  {secondaryLabel}
                </LocalizedLink>
              </Button>
            </div>
          </div>
          <div className="relative hidden items-center justify-center lg:flex">
            <div className="relative w-full max-w-md rounded-2xl border border-amber-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-amber-800/30 dark:bg-amber-950/30 dark:shadow-[inset_0_0_0_1px_rgba(251,191,36,0.15)]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold hyphens-auto break-words">
                    {t("card.title")}
                  </p>
                  <p className="text-sm text-neutral-600 hyphens-auto break-words dark:text-white/70">
                    {t("card.subtitle")}
                  </p>
                </div>
              </div>
              <div className="mt-8 space-y-4 text-sm text-neutral-700 dark:text-white/80">
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-950/20">
                  <TrendingDown className="mt-1 h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="hyphens-auto break-words">
                    {t("perks.discount")}
                  </span>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-950/20">
                  <Truck className="mt-1 h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="hyphens-auto break-words">
                    {t("perks.shipping")}
                  </span>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-950/20">
                  <Star className="mt-1 h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="hyphens-auto break-words">
                    {t("perks.exclusive")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
