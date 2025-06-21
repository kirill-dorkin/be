"use server"
import mongoose from "mongoose";
import { connectToDatabase } from '@/lib/dbConnect';
import { getWorkerWithLeastTasks, assignTaskToWorker, createTask } from '@/services/taskService';
import { revalidateTag } from 'next/cache';
import { AddTaskActionParams } from "@/types";

interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export default async function addTaskAction({
  description,
  totalCost,
  customerName,
  customerPhone,
  laptopBrand,
  laptopModel,
}: AddTaskActionParams): Promise<ApiResponse> {
  try {
    await connectToDatabase();

    const worker = await getWorkerWithLeastTasks();
    if (!worker) {
      return { status: 'error', message: 'No workers available to assign the task to.' };
    }

    const newTask = await createTask({ description, totalCost, customerName, customerPhone, laptopBrand, laptopModel }, worker);

    await assignTaskToWorker(worker, newTask._id as mongoose.Types.ObjectId);

    revalidateTag('/admin');

    return { status: 'success', message: 'Task created and assigned successfully!' };
  } catch (error) {
    return { status: 'error', message: (error as Error).message || 'Internal server error.' };
  }
}
