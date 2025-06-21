import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { UserRole } from "@/types"

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
        message: "User not authenticated",
      };
    }

    const userRole = user.role as UserRole;

    if (requiredRole !== "user" && userRole !== requiredRole) {
      return {
        status: "error",
        message: `Forbidden: You do not have permission to perform this action as a ${requiredRole}`,
      };
    }

    return { status: "success" };
  } catch (error) {
    return {
      status: "error",
      message: (error as { message: string }).message || "Internal server error.",
    };
  }
}

