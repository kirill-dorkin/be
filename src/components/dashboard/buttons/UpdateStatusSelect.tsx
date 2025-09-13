"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Status } from "@/types";
import useCustomToast from "@/hooks/useCustomToast";
import setTaskStatusAction from "@/actions/dashboard/setTaskStatusAction";

export default function UpdateStatusButton({ taskId }: { taskId: string }) {
  const t = useTranslations();
  const [status, setStatus] = React.useState<Status>("Pending");
  const [openDialog, setOpenDialog] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const statusTranslations = {
    Pending: t("tasks.statusPending"),
    "In Progress": t("tasks.statusInProgress"),
    Completed: t("tasks.statusCompleted"),
  };

  const handleStatusChange = (value: Status) => {
    setStatus(value);
    setOpenDialog(true);
  };

  const handleConfirmChange = async () => {
    try {
      setLoading(true);
      const response = await setTaskStatusAction(taskId, status);

      if (response.status === "success") {
        showSuccessToast({
          title: t("common.success"),
          description: `${t("tasks.statusUpdatedTo")} ${statusTranslations[status]}`,
        });
      } else {
        showErrorToast({
          title: t("common.error"),
          description: response.message as string,
        });
      }
    } catch (error) {
      showErrorToast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("common.unknownError"),
      });
    } finally {
      setLoading(false);
      setOpenDialog(false);
    }
  };

  return (
    <div>
      <Select onValueChange={handleStatusChange} value={status}>
        <SelectTrigger>
          <SelectValue placeholder={t("tasks.selectStatus")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{t("tasks.status")}</SelectLabel>
            <SelectItem value="Pending">{t("tasks.statusPending")}</SelectItem>
            <SelectItem value="In Progress">{t("tasks.statusInProgress")}</SelectItem>
            <SelectItem value="Completed">{t("tasks.statusCompleted")}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("tasks.confirmStatusChange")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("tasks.statusChangeDescription")} <span className="font-bold text-primary">{statusTranslations[status]}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDialog(false)}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmChange}>
              {loading ? t("status.updating") : t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
