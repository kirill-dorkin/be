import { ArrowDownRight, ArrowUpRight, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Button } from "@nimara/ui/components/button";

import { getAccessToken } from "@/auth";
import { LocalizedLink } from "@/i18n/routing";
import { getUserBalance } from "@/lib/actions/referral";
import { paths } from "@/lib/paths";
import {
  type BalanceTransactionStatus,
  type BalanceTransactionType,
  MIN_WITHDRAWAL_AMOUNT,
} from "@/lib/referral/types";
import { calculateBalance } from "@/lib/referral/utils";
import { type TranslationMessage } from "@/types";

import { WithdrawalForm } from "./withdrawal-form";

const typeTranslationMap: Record<BalanceTransactionType, TranslationMessage> = {
  ADMIN_ADJUSTMENT: "balance.transaction-type-admin",
  PURCHASE_PAYMENT: "balance.transaction-type-purchase",
  REFERRAL_BONUS: "balance.transaction-type-referral",
  VIP_REFERRAL_BONUS: "balance.transaction-type-vip-referral",
  WITHDRAWAL: "balance.transaction-type-withdrawal",
};

const statusTranslationMap: Record<
  BalanceTransactionStatus,
  TranslationMessage
> = {
  PENDING: "balance.transaction-status-pending",
  COMPLETED: "balance.transaction-status-completed",
  CANCELLED: "balance.transaction-status-cancelled",
};

const isDebitTransaction = (type: BalanceTransactionType) =>
  type === "WITHDRAWAL" || type === "PURCHASE_PAYMENT";

const formatAmount = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default async function BalancePage() {
  const [accessToken, t] = await Promise.all([
    getAccessToken(),
    getTranslations(),
  ]);

  if (!accessToken) {
    redirect(paths.signIn.asPath());
  }

  const balanceResult = await getUserBalance();

  if (!balanceResult.ok) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
        {t("errors.UNKNOWN_ERROR")}
      </div>
    );
  }

  const balanceData = balanceResult.data;
  const currentBalance = calculateBalance(balanceData.transactions);
  const pendingAmount = balanceData.transactions
    .filter((transaction) => transaction.status === "PENDING")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const lifetimeEarned = balanceData.transactions
    .filter(
      (transaction) =>
        transaction.type === "REFERRAL_BONUS" ||
        transaction.type === "VIP_REFERRAL_BONUS",
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="flex flex-col gap-6 text-sm md:gap-8">
      <section className="rounded-3xl border border-slate-100/80 bg-gradient-to-br from-white to-slate-50/60 p-6 shadow-sm ring-1 ring-black/5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/60 dark:ring-white/5">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="dark:text-muted-foreground text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {t("balance.available-balance")}
              </p>
              <p className="dark:text-primary text-4xl font-bold text-slate-900">
                {formatAmount(currentBalance)} {balanceData.currency}
              </p>
              <p className="dark:text-muted-foreground text-sm text-slate-500">
                {t("balance.subtitle")}
              </p>
            </div>
            <div className="grid w-full gap-4 rounded-2xl border border-slate-100 bg-white/80 p-4 text-xs uppercase tracking-[0.2em] text-slate-500 shadow-sm sm:w-auto sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-900/40">
              <div>
                <p>{t("balance.transaction-history")}</p>
                <p className="dark:text-primary text-2xl font-semibold text-slate-900">
                  {balanceData.transactions.length}
                </p>
              </div>
              <div>
                <p>{t("balance.transaction-status-pending")}</p>
                <p className="dark:text-primary text-2xl font-semibold text-slate-900">
                  {formatAmount(pendingAmount)} {balanceData.currency}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                {t("referral.total-earned")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-800 dark:text-emerald-200">
                {formatAmount(lifetimeEarned)} {balanceData.currency}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
                {t("balance.transaction-history")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-blue-800 dark:text-blue-200">
                {balanceData.transactions.length}
              </p>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300">
                {t("balance.transaction-status-pending")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-violet-800 dark:text-violet-200">
                {formatAmount(pendingAmount)} {balanceData.currency}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100/80 bg-white/90 p-6 shadow-sm ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900/40 dark:ring-white/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="dark:text-primary text-lg font-semibold text-slate-900">
              {t("balance.withdrawal-request")}
            </h2>
            <p className="dark:text-muted-foreground text-sm text-slate-500">
              {t("balance.min-withdrawal", {
                amount: MIN_WITHDRAWAL_AMOUNT,
                currency: balanceData.currency,
              })}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <WithdrawalForm
              currentBalance={currentBalance}
              currency={balanceData.currency}
            />
            <Button asChild variant="outline">
              <LocalizedLink href={paths.account.referral.asPath()}>
                {t("referral.get-started")}
              </LocalizedLink>
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100/80 bg-white/90 p-4 shadow-sm ring-1 ring-black/5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/40 dark:ring-white/5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="dark:text-primary text-lg font-semibold text-slate-900">
              {t("balance.transaction-history")}
            </h2>
            <p className="dark:text-muted-foreground text-xs uppercase tracking-[0.2em] text-slate-400">
              {t("balance.title")}
            </p>
          </div>
        </div>
        {balanceData.transactions.length === 0 ? (
          <p className="dark:text-muted-foreground text-center text-slate-500">
            {t("balance.no-transactions")}
          </p>
        ) : (
          <div className="space-y-3">
            {balanceData.transactions
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((transaction) => {
                const isDebit = isDebitTransaction(transaction.type);
                const typeLabel = typeTranslationMap[transaction.type];
                const statusLabel = statusTranslationMap[transaction.status];

                return (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/70"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDebit ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"}`}
                      >
                        {isDebit ? (
                          <ArrowDownRight className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="dark:text-primary font-medium text-slate-900">
                          {t(typeLabel)}
                        </p>
                        <p className="dark:text-muted-foreground text-sm text-slate-500">
                          {transaction.description}
                        </p>
                        <p className="dark:text-muted-foreground text-xs text-slate-400">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                      <p
                        className={`text-lg font-semibold ${isDebit ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
                      >
                        {isDebit ? "-" : "+"}
                        {formatAmount(transaction.amount)}{" "}
                        {balanceData.currency}
                      </p>
                      <div className="dark:text-muted-foreground flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {transaction.status === "PENDING" && (
                          <Clock className="h-3 w-3" />
                        )}
                        {t(statusLabel)}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>
    </div>
  );
}
