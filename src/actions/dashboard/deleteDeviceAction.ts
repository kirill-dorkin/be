"use server"
import { connectToDatabase } from "@/lib/dbConnect";
import Device from "@/models/Device";
import { revalidateTag } from "next/cache";

const deleteDeviceAction = async (id: string) => {
  try {
    await connectToDatabase();
    await Device.findByIdAndDelete(id);
    revalidateTag('/admin/devices');
    return { status: "success", message: "Device deleted" };
  } catch (error) {
    console.error("Error deleting device:", error);
    return { status: "error", message: (error as { message: string }).message || "Internal server error." };
  }
};

export default deleteDeviceAction;
