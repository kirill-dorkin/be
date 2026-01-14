import { Crown, ShieldCheck, TrendingDown, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

type MembershipBannerProps = {
  user: User | null;
};

export const MembershipBanner = async ({ user }: MembershipBannerProps) => {
  const t = await getTranslations("home.membershipBanner");

  const isMember = Boolean(user);
  const title = isMember ? t("titleMember") : t("titleGuest");
  const description = isMember
    ? t("descriptionMember")
    : t("descriptionGuest");
  const primaryCta = isMember ? t("primaryCtaMember") : t("primaryCtaGuest");
  const secondaryLabel = isMember
    ? t("secondaryMember")
    : t("secondaryGuest");
  const secondaryHref = isMember
    ? paths.account.profile.asPath()
    : paths.createAccount.asPath();

  return (
    <section className="w-full text-neutral-900">
      <div className="relative mx-auto overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">
        <div className="relative grid gap-10 p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:p-12">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
              <Crown className="h-3.5 w-3.5 text-amber-600" />
              {t("badge")}
            </span>
            <h2 className="hyphens-auto break-words text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {title}
            </h2>
            <p className="hyphens-auto break-words text-sm text-neutral-700 sm:text-base">
              {description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-amber-500 text-white shadow-sm hover:bg-amber-600"
              >
                <LocalizedLink href={paths.membership.asPath()}>
                  <Crown className="mr-2 h-4 w-4" />
                  {primaryCta}
                </LocalizedLink>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
              >
                <LocalizedLink href={secondaryHref}>
                  {secondaryLabel}
                </LocalizedLink>
              </Button>
            </div>
          </div>
            <div className="relative hidden items-center justify-center lg:flex">
              <div className="relative w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg">
                    <Crown className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground hyphens-auto break-words text-lg font-semibold">
                      {t("card.title")}
                    </p>
                    <p className="hyphens-auto break-words text-sm text-neutral-600">
                      {t("card.subtitle")}
                    </p>
                  </div>
                </div>
                <div className="mt-8 space-y-4 text-sm text-neutral-700">
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3">
                    <TrendingDown className="mt-1 h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <span className="hyphens-auto break-words">
                      {t("perks.discount")}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3">
                    <Truck className="mt-1 h-5 w-5 text-amber-600" />
                    <span className="hyphens-auto break-words">
                      {t("perks.shipping")}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3">
                    <ShieldCheck className="mt-1 h-5 w-5 text-amber-600" />
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
