"use server"
import { connectToDatabase } from "@/shared/lib/dbConnect";
import Device from "@/entities/device/Device";
import { revalidateTag } from "next/cache";

const addDeviceAction = async (category: string, brand: string, model?: string) => {
  try {
    await connectToDatabase();
    const device = new Device({ category, brand, model });
    await device.save();
    revalidateTag('/admin/devices');
    return { status: "success", message: "Устройство создано" };
  } catch (error) {
    console.error("Error adding device:", error);
    return { status: "error", message: (error as { message: string }).message || "Внутренняя ошибка сервера." };
  }
};

export { addDeviceAction };
