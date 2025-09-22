'use server';

import mongoose from "mongoose";
import { connectToDatabase } from "@/shared/lib/dbConnect";
import { getWorkerWithLeastTasks, assignTaskToWorker, createTask } from '@/services/taskService';
import { revalidateTag } from 'next/cache';
import type { AddTaskActionParams } from "@/shared/types";

interface ApiResponse<T = Record<string, string | number | boolean>> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export async function addTaskAction({
  description,
  totalCost,
  customerName,
  customerPhone,
  laptopBrand,
  laptopModel,
}: AddTaskActionParams): Promise<ApiResponse> {
  console.log('🚀 addTaskAction STARTED - Server Action called');
  console.log('📝 Received params:', {
    description,
    totalCost,
    customerName,
    customerPhone,
    laptopBrand,
    laptopModel,
  });

  try {
    await connectToDatabase();

    const worker = await getWorkerWithLeastTasks();
    console.log('Found worker:', worker?._id);

    const newTask = await createTask(
      { description, totalCost, customerName, customerPhone, laptopBrand, laptopModel },
      worker,
    );
    console.log('Created task:', newTask._id);

    if (worker) {
      await assignTaskToWorker(worker, newTask._id as mongoose.Types.ObjectId);
      console.log('Assigned task to worker');
    }

    revalidateTag('/admin');

    return {
      status: 'success',
      message: worker
        ? 'Задача создана и назначена успешно!'
        : 'Задача создана успешно, но нет доступного работника для назначения.',
    };
  } catch (error) {
    console.error('Error in addTaskAction:', error);
    return { status: 'error', message: (error as Error).message || 'Внутренняя ошибка сервера.' };
  }
}
