"use server"
import { connectToDatabase } from "@/shared/lib/dbConnect";
import User from "@/entities/user/User";
import bcrypt from "bcryptjs";
import { checkUserPermission } from "@/services";

const addUserAction = async (
  name: string,
  email: string,
  password: string,
  role: "worker" = "worker"
) => {
  try {
    const permissionCheck = await checkUserPermission("admin");
    if (permissionCheck.status === "error") {
      return permissionCheck;
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { status: "error", message: "User with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      role,
      image: `https://i.pravatar.cc/150?u=${email}`,
      passwordHash,
    });
    await user.save();

    return { status: "success", message: "User created successfully." };
  } catch (error) {
    console.error("Error adding user:", error);
    return { status: "error", message: (error as { message: string }).message || "Internal server error." };
  }
};

export default addUserAction;
