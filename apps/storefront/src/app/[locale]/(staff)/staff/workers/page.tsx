import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Badge } from "@nimara/ui/components/badge";
import { Button } from "@nimara/ui/components/button";

import { auth } from "@/auth";
import { serverEnvs } from "@/envs/server";
import { paths } from "@/lib/paths";
import { REPAIR_STATUS } from "@/lib/repair/metadata";
import { fetchRepairWorkers } from "@/services/repair-workers";

import { approveWorker, rejectWorker, resetWorkerStatus } from "./actions";

export default async function StaffWorkersAdminPage() {
  const session = await auth();

  const user = session?.user as
    | undefined
    | {
        isStaff?: boolean;
        permissionGroups?: Array<{ name: string }>;
      };

  const repairGroupName = serverEnvs.SERVICE_WORKER_GROUP_NAME;
  const belongsToRepairGroup = Boolean(
    user?.isStaff &&
      user.permissionGroups?.some((group) => group.name === repairGroupName),
  );

  if (!belongsToRepairGroup) {
    redirect(paths.staff.orders.asPath());
  }

  const t = await getTranslations("staff-workers");
  const workers = await fetchRepairWorkers();

  const statusBadge = (status: string) => {
    switch (status) {
      case REPAIR_STATUS.approved:
        return (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">
            {t("statuses.approved")}
          </Badge>
        );
      case REPAIR_STATUS.rejected:
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-900">
            {t("statuses.rejected")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-dashed">
            {t("statuses.pending")}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/40 bg-background shadow-sm">
        <table className="min-w-full divide-y divide-border/60">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">{t("table.name")}</th>
              <th className="px-4 py-3">{t("table.email")}</th>
              <th className="px-4 py-3">{t("table.phone")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-sm">
            {workers.map((worker) => (
              <tr key={worker.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">
                    {worker.firstName} {worker.lastName}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {worker.email}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {worker.phone || "—"}
                </td>
                <td className="px-4 py-3">{statusBadge(worker.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {worker.status !== REPAIR_STATUS.approved && (
                      <form
                        action={async () => {
                          "use server";
                          await approveWorker(worker.id);
                        }}
                      >
                        <Button size="sm" variant="secondary">
                          {t("actions.approve")}
                        </Button>
                      </form>
                    )}
                    {worker.status !== REPAIR_STATUS.rejected && (
                      <form
                        action={async () => {
                          "use server";
                          await rejectWorker(worker.id);
                        }}
                      >
                        <Button size="sm" variant="ghost">
                          {t("actions.reject")}
                        </Button>
                      </form>
                    )}
                    {worker.status !== REPAIR_STATUS.pending && (
                      <form
                        action={async () => {
                          "use server";
                          await resetWorkerStatus(worker.id);
                        }}
                      >
                        <Button size="sm" variant="outline">
                          {t("actions.reset")}
                        </Button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {workers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
