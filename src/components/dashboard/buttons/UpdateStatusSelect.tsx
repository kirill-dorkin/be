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

  const [status, setStatus] = React.useState<Status>("Pending");
  const [openDialog, setOpenDialog] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const statusTranslations = {
    Pending: "Ожидает",
    "In Progress": "В процессе",
    Completed: "Завершено",
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
          title: "Успех",
          description: `Статус обновлен на ${statusTranslations[status]}`,
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
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
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
            <SelectItem value="Pending">Ожидает</SelectItem>
            <SelectItem value="In Progress">В процессе</SelectItem>
            <SelectItem value="Completed">Завершено</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердить изменение статуса</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите изменить статус на <span className="font-bold text-primary">{statusTranslations[status]}</span>?
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
