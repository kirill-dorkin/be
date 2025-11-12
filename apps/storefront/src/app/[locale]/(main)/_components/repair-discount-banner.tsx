import { ShieldCheck, Sparkles, UserCheck, Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

type RepairDiscountBannerProps = {
  user: User | null;
};

export const RepairDiscountBanner = async ({
  user,
}: RepairDiscountBannerProps) => {
  const t = await getTranslations("home.repairBanner");

  const title = user ? t("titleMember") : t("titleGuest");
  const description = user
    ? t("descriptionMember")
    : t("descriptionGuest");
  const secondaryLabel = user
    ? t("secondaryMember")
    : t("secondaryGuest");
  const secondaryHref = user
    ? paths.account.orders.asPath()
    : paths.createAccount.asPath();

  return (
    <section className="mb-4 mt-8 w-full px-4 text-neutral-900 sm:px-6 lg:px-8 dark:text-white">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-neutral-950 dark:shadow-[0_48px_120px_rgba(0,0,0,0.45)]">
        <div className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/20" />
        <div className="absolute -right-32 -top-12 hidden h-80 w-80 rounded-full bg-orange-300/15 blur-3xl dark:bg-orange-400/10 lg:block" />
        <div className="relative grid gap-10 p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:p-16">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600 dark:border-white/15 dark:text-white/70">
              {t("badge")}
            </span>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight hyphens-auto break-words sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="text-base text-neutral-600 hyphens-auto break-words sm:text-lg dark:text-white/75">
              {description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-neutral-900 text-white hover:bg-neutral-900/90 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/90"
              >
                <LocalizedLink href={paths.services.asPath()}>
                  {t("primaryCta")}
                </LocalizedLink>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="border border-neutral-200 bg-neutral-100 text-neutral-800 hover:bg-neutral-200/60 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <LocalizedLink href={secondaryHref}>
                  {secondaryLabel}
                </LocalizedLink>
              </Button>
            </div>
          </div>
          <div className="relative hidden items-center justify-center lg:flex">
            <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-200/40 dark:bg-amber-400/20">
                  <Wrench className="h-7 w-7 text-amber-500 dark:text-amber-200" />
                </div>
                <div>
                  <p className="text-lg font-semibold hyphens-auto break-words">
                    {t("card.title")}
                  </p>
                  <p className="text-sm text-neutral-500 hyphens-auto break-words dark:text-white/70">
                    {t("card.subtitle")}
                  </p>
                </div>
              </div>
              <div className="mt-8 space-y-4 text-sm text-neutral-700 dark:text-white/80">
                <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-white/10 dark:bg-black/20">
                  <Sparkles className="mt-1 h-5 w-5 text-amber-500 dark:text-amber-300" />
                  <span className="hyphens-auto break-words">
                    {t("perks.priority")}
                  </span>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-white/10 dark:bg-black/20">
                  <ShieldCheck className="mt-1 h-5 w-5 text-amber-500 dark:text-amber-300" />
                  <span className="hyphens-auto break-words">
                    {t("perks.warranty")}
                  </span>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-white/10 dark:bg-black/20">
                  <UserCheck className="mt-1 h-5 w-5 text-amber-500 dark:text-amber-300" />
                  <span className="hyphens-auto break-words">
                    {t("perks.tracking")}
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
