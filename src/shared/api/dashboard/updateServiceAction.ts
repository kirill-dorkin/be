"use server";

import { connectToDatabase } from "@/shared/lib/dbConnect";
import Service from "@/entities/service/Service";
import Category from "@/entities/category/Category";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export interface UpdateServiceData {
  category: string;
  name: string;
  cost: number;
  duration?: string;
}

export async function updateServiceAction(
  id: string,
  data: UpdateServiceData
): Promise<{ message: string; status: string }> {
  try {
    // Валидация входных данных
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return {
        message: "Некорректный ID услуги",
        status: "error",
      };
    }

    if (!data.category || !data.name || data.cost < 0 || !data.duration) {
      return {
        message: "Все поля обязательны для заполнения. Стоимость не может быть отрицательной",
        status: "error",
      };
    }

    await connectToDatabase();
    
    // Проверяем существование услуги
    const existingService = await Service.findById(id);
    if (!existingService) {
      return {
        message: "Услуга не найдена",
        status: "error",
      };
    }

    // Проверяем существование категории
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) {
      return {
        message: "Категория не найдена",
        status: "error",
      };
    }

    // Проверяем уникальность названия (исключая текущую услугу)
    const duplicateService = await Service.findOne({
      name: data.name,
      _id: { $ne: id },
    });

    if (duplicateService) {
      return {
        message: "Услуга с таким названием уже существует",
        status: "error",
      };
    }

    // Обновляем услугу
    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        category: data.category,
        name: data.name,
        cost: Number(data.cost),
        duration: data.duration,
      },
      { new: true }
    );

    if (!updatedService) {
      return {
        message: "Не удалось обновить услугу",
        status: "error",
      };
    }

    // Обновляем кэш страницы
    revalidatePath("/admin/services");

    return {
      message: "Услуга успешно обновлена",
      status: "success",
    };
  } catch (error) {
    console.error("Ошибка при обновлении услуги:", error);
    return {
      message: "Произошла ошибка при обновлении услуги",
      status: "error",
    };
  }
}