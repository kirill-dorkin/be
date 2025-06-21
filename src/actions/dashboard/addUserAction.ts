"use server"
import { connectToDatabase } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { checkUserPermission } from "@/services";
import { revalidateTag } from "next/cache";

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
    revalidateTag('/admin');

    return { status: "success", message: "User created successfully." };
  } catch (error) {
    console.error("Error adding user:", error);
    return { status: "error", message: (error as { message: string }).message || "Internal server error." };
  }
};

export default addUserAction;
