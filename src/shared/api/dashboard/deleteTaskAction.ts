"use server";

import { connectToDatabase } from "@/shared/lib/dbConnect";
import Task from "@/entities/task/Task";
import User from "@/entities/user/User";
import { checkUserPermission } from "@/services";
import { revalidateTag } from 'next/cache';

const deleteTaskAction = async (taskId: string) => {
  try {
    const permissionCheck = await checkUserPermission("admin");
    if (permissionCheck.status === "error") {
      return permissionCheck;
    }

    if (!taskId) {
      return {
        status: "error",
        message: "Task ID is required",
      };
    }

    await connectToDatabase();

    const deleteResult = await Task.deleteOne({ _id: taskId });

    if (deleteResult.deletedCount === 0) {
      return {
        status: "error",
        message: "Task not found",
      };
    }

    await User.updateOne(
      { tasks: taskId },
      { $pull: { tasks: taskId } }
    );

    revalidateTag('/admin');

    return {
      status: "success",
      message: "Task deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting task:", error);
    return {
      status: "error",
      message: (error as { message: string }).message || "Internal server error.",
    };
  }
};

export default deleteTaskAction;

