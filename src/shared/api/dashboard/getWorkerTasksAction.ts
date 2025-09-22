"use server";
import { connectToDatabase } from "@/shared/lib/dbConnect";
import Task from "@/entities/task/Task";
import { serializeData } from "@/shared/lib/utils";
import { checkUserPermission } from "@/services";

const getWorkerTasksAction = async (workerId: string, page: number = 1, limit: number = 5) => {
  try {
    const permissionCheck = await checkUserPermission("worker");
    if (permissionCheck.status === "error") {
      return permissionCheck;
    }

    const skip = (page - 1) * limit;

    await connectToDatabase();

    // Fetch tasks assigned to the given workerId
    const tasks = await Task.find({ workerId }).skip(skip).limit(limit).lean();
    const totalItemsLength = await Task.countDocuments({ workerId });

    const response = {
      status: "success",
      items: serializeData(tasks),
      totalItemsLength,
    };

    return response;
  } catch (error) {
    console.error("Error fetching worker tasks:", error);
    return {
      status: "error",
      message: (error as { message: string }).message || "Внутренняя ошибка сервера.",
    };
  }
};

export { getWorkerTasksAction };

