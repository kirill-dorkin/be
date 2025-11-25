"use client";

import { Gift, Users, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { REFERRAL_BONUS_AMOUNT } from "@/lib/referral/types";

interface ReferralWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
}

export function ReferralWelcomeModal({
  isOpen,
  onClose,
  referralCode,
}: ReferralWelcomeModalProps) {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
              <Gift className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {t("referral.welcome-title")}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {t("referral.welcome-subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 text-center dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-primary">
                {t("referral.step-1-title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-muted-foreground">
                {t("referral.welcome-step-1")}
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 text-center dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Gift className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-primary">
                {t("referral.step-2-title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-muted-foreground">
                {t("referral.welcome-step-2")}
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 text-center dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-primary">
                {t("referral.step-3-title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-muted-foreground">
                {t("referral.welcome-step-3", {
                  amount: REFERRAL_BONUS_AMOUNT,
                  currency: t("common.currency"),
                })}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 p-4 dark:from-violet-950/30 dark:to-purple-950/30">
            <p className="text-center text-sm font-semibold text-violet-900 dark:text-violet-300">
              {t("referral.bonus-info", {
                amount: REFERRAL_BONUS_AMOUNT,
                currency: t("common.currency"),
              })}
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-center dark:border-slate-700 dark:bg-slate-900/30">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-muted-foreground">
              {t("referral.your-referral-link")}
            </p>
            <p className="mt-1 font-mono text-lg text-slate-900 dark:text-primary">
              {referralCode}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t("common.close")}
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <LocalizedLink href={paths.account.referral.asPath()}>
              {t("referral.view-my-link")}
            </LocalizedLink>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
