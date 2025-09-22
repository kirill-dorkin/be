// Services
export * from './taskService'

import authOptions from '@/auth';
import { getServerSession } from 'next-auth';
import { UserRole } from "@/shared/types"

export async function checkUserPermission(requiredRole: UserRole) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user) {
      if (requiredRole === "user") {
        return { status: "success" };
      }
      return {
        status: "error",
        message: "Пользователь не аутентифицирован",
      };
    }

    const userRole = user.role as UserRole;

    if (requiredRole !== "user" && userRole !== requiredRole) {
      return {
        status: "error",
        message: `Запрещено: У вас нет прав для выполнения этого действия как ${requiredRole}`,
      };
    }

    return { status: "success" };
  } catch (error) {
    return {
      status: "error",
      message: (error as { message: string }).message || "Внутренняя ошибка сервера.",
    };
  }
}

