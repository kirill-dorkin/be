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
import { showToast } from "@/shared/lib/toast";
import { setTaskStatusAction } from "@/shared/api/dashboard/setTaskStatusAction";

export default function UpdateStatusButton({ 
  taskId, 
  currentStatus = "Pending" 
}: { 
  taskId: string;
  currentStatus?: Status;
}) {
  const [status, setStatus] = React.useState<Status>(currentStatus);
  const [openDialog, setOpenDialog] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  // Обновляем статус при изменении currentStatus
  React.useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);


  const handleStatusChange = (value: Status) => {
    setStatus(value);
    setOpenDialog(true);
  };

  const handleConfirmChange = async () => {
    try {
      setLoading(true);
      const response = await setTaskStatusAction(taskId, status);

      if (response.status === "success") {
        showToast.success(`Статус задачи успешно изменен на ${{
          Pending: "В ожидании",
          "In Progress": "В процессе",
          Completed: "Завершено",
        }[status]}`);
      } else {
        showToast.error(response.message as string);
      }
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Произошла неизвестная ошибка.");
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
