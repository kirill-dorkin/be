"use server"
import { connectToDatabase } from "@/lib/dbConnect";
import User from "@/models/User";
import { serializeData } from "@/lib/utils";

const getWorkersAction = async (page: number = 1, limit: number = 5) => {
  try {
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const workers = await User.find({ role: "worker" })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalItemsLength = await User.countDocuments({ role: "worker" });

    const response = {
      status: "success",
      message: "Workers fetched successfully.",
      items: serializeData(workers),
      totalItemsLength,
    };

    return response;
  } catch (error) {
    console.error("Error fetching workers:", error);
    return {
      status: "error",
      message: (error as { message: string }).message || "Internal server error.",
    };
  }
};

export default getWorkersAction;

