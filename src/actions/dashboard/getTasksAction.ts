"use server"
import { connectToDatabase } from "@/lib/dbConnect";
import Task from "@/models/Task";
import { serializeData } from "@/lib/utils";

const getTasksAction = async (page: number = 1, limit: number = 5) => {
  try {
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const tasks = await Task.find().skip(skip).limit(limit).lean();
    const totalItemsLength = await Task.countDocuments();

    const response = {
      status: "success",
      items: serializeData(tasks),
      totalItemsLength,
    };

    return response;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {
      status: "error",
      message: (error as { message: string }).message || "Internal server error.",
    };
  }
};

export default getTasksAction;
