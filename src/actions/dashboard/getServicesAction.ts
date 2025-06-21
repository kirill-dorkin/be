"use server"
import { connectToDatabase } from "@/lib/dbConnect";
import Service from "@/models/Service";
import { serializeData } from "@/lib/utils";

const getServicesAction = async (page: number = 1, limit: number = 5) => {
  try {
    const skip = (page - 1) * limit;
    await connectToDatabase();
    const services = await Service.find().populate('device').skip(skip).limit(limit).lean();
    const totalItemsLength = await Service.countDocuments();
    return { status: "success", items: serializeData(services), totalItemsLength };
  } catch (error) {
    console.error("Error fetching services:", error);
    return { status: "error", message: (error as { message: string }).message || "Internal server error." };
  }
};

export default getServicesAction;
