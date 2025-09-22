"use server";
'use server';

import { connectToDatabase } from "@/shared/lib/dbConnect";
import Task from "@/entities/task/Task";

const getTaskByIdAction = async (taskId: string) => {
  try {
    if (!taskId) {
      return { status: "error", message: "ID задачи обязателен" };
    }

    await connectToDatabase();

    const task = await Task.findById(taskId).lean();

    if (!task) {
      return { status: "error", message: "Задача не найдена" };
    }

    return { status: "success", item: JSON.parse(JSON.stringify(task)) };
  } catch (error) {
    console.error("Error fetching task:", error);
    return {
      status: "error",
      message: (error as { message: string }).message || "Внутренняя ошибка сервера.",
    };
  }
};

export { getTaskByIdAction };
