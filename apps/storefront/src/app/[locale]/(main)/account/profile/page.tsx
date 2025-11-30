import { Users, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { ReferralWelcomeWrapper } from "@/components/referral/welcome-wrapper";
import { LocalizedLink } from "@/i18n/routing";
import { getReferralData } from "@/lib/actions/referral";
import { paths } from "@/lib/paths";
import { calculateBalance } from "@/lib/referral/utils";
import { getUserService } from "@/services/user";

import { UpdateEmailModal } from "./_modals/update-email-modal";
import { UpdateNameModal } from "./_modals/update-name-modal";
import { UpdatePasswordModal } from "./_modals/update-password-modal";

type PageProps = {
  searchParams: Promise<Record<string, string>>;
};

export default async function Page({ searchParams }: PageProps) {
  const [accessToken, t, userService, resolvedSearchParams] = await Promise.all(
    [getAccessToken(), getTranslations(), getUserService(), searchParams],
  );

  const resultUserGet = await userService.userGet(accessToken);

  const user = resultUserGet.ok ? resultUserGet.data : null;

  // Get referral and balance data
  const referralResult = await getReferralData();
  const referralPayload = referralResult.ok ? referralResult.data : null;
  const referralStats = referralPayload?.referralData;
  const referralBalance = referralPayload?.balance;
  const currentBalance = referralBalance
    ? calculateBalance(referralBalance.transactions)
    : 0;
  const showReferralPromo = resolvedSearchParams?.referralPromo === "true";
  const defaultUsername = user?.firstName ?? t("staff.orderCard.customer");
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    defaultUsername;
  const initialsSource = fullName || user?.email || "BE";
  const initials =
    initialsSource
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "BE";

  const profileFields = [
    {
      key: "name",
      label: t("account.first-and-last-name"),
      value: fullName,
      action: <UpdateNameModal user={user} />,
    },
    {
      key: "email",
      label: t("common.email"),
      value: user?.email ?? "-",
      action: user ? <UpdateEmailModal user={user} /> : null,
    },
    {
      key: "password",
      label: t("common.password"),
      value: "•••••••••••••",
      action: <UpdatePasswordModal />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-sm md:gap-8">
      <section className="rounded-3xl border border-slate-100/80 bg-white/80 p-6 shadow-sm ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900/40 dark:ring-white/5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="dark:text-primary flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white text-xl font-semibold uppercase text-slate-700 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
              {initials}
            </div>
            <div>
              <p className="dark:text-muted-foreground text-xs font-semibold uppercase tracking-widest text-slate-400">
                {t("account.personal-data")}
              </p>
              <h2 className="dark:text-primary text-2xl font-semibold text-slate-900">
                {fullName}
              </h2>
              {user?.email && (
                <p className="dark:text-muted-foreground text-sm text-slate-500">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <div className="dark:text-muted-foreground rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:border-slate-700">
            {t("account.hello", { username: defaultUsername })}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100/80 bg-white/90 p-4 shadow-sm ring-1 ring-black/5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/40 dark:ring-white/5">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {profileFields.map((field) => (
            <div
              key={field.key}
              className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:gap-8"
            >
              <div className="flex-1">
                <p className="dark:text-muted-foreground text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {field.label}
                </p>
                <p className="dark:text-primary text-base font-medium text-slate-700">
                  {field.value}
                </p>
              </div>
              {field.action && (
                <div className="flex w-full justify-stretch md:w-auto md:justify-end">
                  {field.action}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <LocalizedLink
          href={paths.account.balance.asPath()}
          className="block rounded-3xl border border-slate-100/80 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:border-slate-800 dark:from-slate-900/40 dark:to-slate-800/40 dark:ring-white/5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="dark:text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {t("balance.title")}
              </p>
              <p className="dark:text-primary text-3xl font-bold text-slate-900">
                {currentBalance} {t("common.currency")}
              </p>
            </div>
          </div>
        </LocalizedLink>

        <LocalizedLink
          href={paths.account.referral.asPath()}
          className="block rounded-3xl border border-slate-100/80 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:border-slate-800 dark:from-slate-900/40 dark:to-slate-800/40 dark:ring-white/5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="dark:text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {t("referral.title")}
              </p>
              <p className="dark:text-primary text-3xl font-bold text-slate-900">
                {referralStats?.vipReferralCount ?? 0}
              </p>
              <p className="dark:text-muted-foreground mt-1 text-xs text-slate-500">
                {t("referral.vip-referrals")}
              </p>
            </div>
          </div>
        </LocalizedLink>
      </section>

      {referralStats?.referralCode && (
        <ReferralWelcomeWrapper
          referralCode={referralStats.referralCode}
          isNewUser={(referralStats.referralCount ?? 0) === 0}
          forceShow={showReferralPromo}
          delayMs={showReferralPromo ? 20000 : undefined}
          clearQueryParam={showReferralPromo ? "referralPromo" : undefined}
        />
      )}
    </div>
  );
}
