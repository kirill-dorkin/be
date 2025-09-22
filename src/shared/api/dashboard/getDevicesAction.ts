"use server"
import { connectToDatabase } from "@/shared/lib/dbConnect";
import Device from "@/entities/device/Device";
import { serializeData } from "@/shared/lib/utils";

const getDevicesAction = async (page: number = 1, limit: number = 5) => {
  try {
    const skip = (page - 1) * limit;
    await connectToDatabase();
    const devices = await Device.find().populate('category').skip(skip).limit(limit).lean();
    const totalItemsLength = await Device.countDocuments();
    return { status: "success", items: serializeData(devices), totalItemsLength };
  } catch (error) {
    console.error("Error fetching devices:", error);
    return { status: "error", message: (error as { message: string }).message || "Internal server error." };
  }
};

export default getDevicesAction;
