"use server";

import { connectToDatabase } from "@/shared/lib/dbConnect";
import User from "@/entities/user/User";
import { checkUserPermission } from "@/services";
import { revalidateTag } from 'next/cache';

const deleteUserAction = async (userId: string) => {
  try {
    const permissionCheck = await checkUserPermission("admin");
    if (permissionCheck.status === "error") {
      return permissionCheck;
    }

    if (!userId) {
      return {
        status: "error",
        message: "ID пользователя обязателен.",
      };
    }

    await connectToDatabase();

    const userToDelete = await User.findByIdAndDelete(userId);

    if (!userToDelete) {
      return {
        status: "error",
        message: "Пользователь не найден.",
      };
    }

    revalidateTag('/admin');

    return {
      status: "success",
      message: "Пользователь удален успешно!",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      status: "error",
      message: (error as { message: string }).message || "Внутренняя ошибка сервера.",
    };
  }
};

export { deleteUserAction };

