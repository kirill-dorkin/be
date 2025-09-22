"use server"
import { connectToDatabase } from "@/shared/lib/dbConnect";
import Role from "@/entities/user/Role";
import { checkUserPermission } from "@/services";
import { revalidateTag } from "next/cache";
import { saveUser } from "@/shared/lib/dbUtils";

export async function setUserRoleAction({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  try {

    const permissionCheck = await checkUserPermission("admin");
    if (permissionCheck.status === "error") {
      return permissionCheck;
    }

    if (!email || !role) {
      return {
        status: "error",
        message: "Email and role are required.",
      };
    }

    const validRoles = ["admin", "worker", "user"];
    if (!validRoles.includes(role)) {
      return {
        status: "error",
        message: `Invalid role. Valid roles are: ${validRoles.join(", ")}`,
      };
    }

    await connectToDatabase();

    const existingRole = await Role.findOne({ email });

    if (existingRole) {

      existingRole.role = role;
      await existingRole.save();

      await saveUser({
        email,
        role,
      });

      revalidateTag("/admin");

      return {
        status: "success",
        message: "Role updated successfully.",
      };
    }

    const newRole = new Role({ email, role });
    await newRole.save();

    await saveUser({
      email,
      role,
    });

    revalidateTag("/admin");

    return {
      status: "success",
      message: "Role added successfully.",
    };
  } catch (error) {

    return {
      status: "error",
      message: (error as { message: string }).message || "Internal server error.",
    };
  }
}
