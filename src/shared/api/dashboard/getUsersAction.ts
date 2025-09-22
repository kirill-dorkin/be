import { connectToDatabase } from "@/shared/lib/dbConnect";
import User from "@/entities/user/User";
import { serializeData } from "@/shared/lib/utils";

const getUsersAction = async (page: number = 1, limit: number = 5) => {
  try {
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .lean();

    const totalItemsLength = await User.countDocuments();

    const response = {
      status: "success",
      message: "Users fetched successfully.",
      items: serializeData(users),
      totalItemsLength,
    };

    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      status: "error",
      message: (error as { message: string }).message || "Internal server error.",
    };
  }
};

export default getUsersAction;
