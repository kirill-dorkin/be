"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Status } from "@/shared/types";
import useCustomToast from "@/shared/lib/useCustomToast";
import setTaskStatusAction from "@/shared/api/dashboard/setTaskStatusAction";

export default function UpdateStatusButton({ taskId }: { taskId: string }) {
  const [status, setStatus] = React.useState<Status>("Pending");
  const [openDialog, setOpenDialog] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();

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
          title: "Успешно",
          description: `Статус задачи успешно изменен на ${{
            Pending: "В ожидании",
            "In Progress": "В процессе",
            Completed: "Завершено",
          }[status]}`,
        });
      } else {
        showErrorToast({
          title: "Ошибка",
          description: response.message as string,
        });
      }
    } catch (error) {
      showErrorToast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
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
          <SelectValue placeholder="Выберите статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Статус</SelectLabel>
            <SelectItem value="Pending">В ожидании</SelectItem>
            <SelectItem value="In Progress">В процессе</SelectItem>
            <SelectItem value="Completed">Завершено</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены, что хотите изменить статус?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие обновит статус задачи на <span className="font-bold text-primary">{{
                Pending: "В ожидании",
                "In Progress": "В процессе",
                Completed: "Завершено",
              }[status]}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDialog(false)}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmChange}>
              {loading ? "Обновление..." : "Подтвердить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
