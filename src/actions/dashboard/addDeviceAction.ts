"use server"
import { connectToDatabase } from "@/lib/dbConnect";
import Device from "@/models/Device";
import { revalidateTag } from "next/cache";

const addDeviceAction = async (name: string) => {
  try {
    await connectToDatabase();
    const device = new Device({ name });
    await device.save();
    revalidateTag('/admin/devices');
    return { status: "success", message: "Device created" };
  } catch (error) {
    console.error("Error adding device:", error);
    return { status: "error", message: (error as { message: string }).message || "Internal server error." };
  }
};

export default addDeviceAction;
