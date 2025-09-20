"use server";

import { connectToDatabase } from "@/lib/dbConnect";
import User from "@/models/User";
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
        message: "User ID is required.",
      };
    }

    await connectToDatabase();

    const userToDelete = await User.findByIdAndDelete(userId);

    if (!userToDelete) {
      return {
        status: "error",
        message: "User not found.",
      };
    }

    revalidateTag('/admin');

    return {
      status: "success",
      message: "User deleted successfully!",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      status: "error",
      message: (error as { message: string }).message || "Internal server error.",
    };
  }
};

export default deleteUserAction;

