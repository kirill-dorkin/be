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
          title: "Success",
          description: `Task status updated to ${status} successfully.`,
        });
      } else {
        showErrorToast({
          title: "Error",
          description: response.message as string,
        });
      }
    } catch (error) {
      showErrorToast({
        title: "Error",
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
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Status</SelectLabel>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to change the status?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will update the task status to <span className="font-bold text-primary">{status}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmChange}>
              {loading ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
