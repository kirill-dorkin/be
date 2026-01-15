import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { serverEnvs } from "@/envs/server";
import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import {
  isApprovedRepairWorker,
  isPendingRepairWorker,
} from "@/lib/repair/metadata";
import type { SupportedLocale } from "@/regions/types";

import { WorkerApplyForm } from "./form";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export default async function StaffApplyPage({ params }: PageProps) {
  const [{ locale }, t, session] = await Promise.all([
    params,
    getTranslations("staff-apply"),
    auth(),
  ]);

  const user = session?.user as
    | undefined
    | {
        isStaff?: boolean;
        metadata?: Record<string, string>;
        permissionGroups?: Array<{ name: string }>;
      };

  const repairGroupName = serverEnvs.SERVICE_WORKER_GROUP_NAME;
  const leadGroupName = serverEnvs.SERVICE_LEAD_WORKER_GROUP_NAME;
  const belongsToWorkerGroup = Boolean(
    user?.isStaff &&
      user.permissionGroups?.some(
        (group) =>
          group.name === repairGroupName ||
          (leadGroupName && group.name === leadGroupName),
      ),
  );

  const approvedWorker = isApprovedRepairWorker(user?.metadata);
  const pendingWorker = isPendingRepairWorker(user?.metadata);

  if (belongsToWorkerGroup || approvedWorker || pendingWorker) {
    redirect({ href: paths.staff.orders.asPath(), locale });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center">
        <span className="text-primary bg-primary/10 inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          {t("badge")}
        </span>
        <h1 className="text-foreground text-3xl font-semibold sm:text-4xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
      </div>

      <div className="border-border/40 bg-background rounded-2xl border p-6 shadow-sm lg:p-8">
        <WorkerApplyForm />
      </div>

      <p className="text-muted-foreground text-center text-xs">
        {t("disclaimer")}
      </p>
    </div>
  );
}
