"use server";

import { connectToDatabase } from "@/shared/lib/dbConnect";
import Task from "@/entities/task/Task";
import { checkUserPermission } from "@/services";
import { revalidateTag } from "next/cache";
import type { Status } from "@/shared/types";
import { sendInvoiceToWhatsApp } from "@/services/taskService";

const setTaskStatusAction = async (taskId: string, newStatus: Status) => {
  try {
    const permissionCheck = await checkUserPermission("worker");
    if (permissionCheck.status === "error") {
      return permissionCheck;
    }

    if (!taskId) {
      return {
        status: "error",
        message: "Task ID is required",
      };
    }

    if (!newStatus) {
      return {
        status: "error",
        message: "New status is required",
      };
    }

    await connectToDatabase();

    const task = await Task.findById(taskId);
    if (!task) {
      return {
        status: "error",
        message: "Task not found",
      };
    }

    task.status = newStatus;
    await task.save();

    if (newStatus === "Completed") {
      const invoiceResponse = await sendInvoiceToWhatsApp(task);
      if (invoiceResponse.status === "error") {
        revalidateTag("/admin");
        return {
          status: "error",
          message: `Task status updated, but failed to send invoice: ${invoiceResponse.message}`,
        };
      }
    }

    revalidateTag("/admin");

    return {
      status: "success",
      message: `Task status updated to ${newStatus} successfully`,
    };
  } catch (error) {
    console.error("Error updating task status:", error);
    return {
      status: "error",
      message: (error as { message: string }).message || "Internal server error.",
    };
  }
};

export default setTaskStatusAction;
