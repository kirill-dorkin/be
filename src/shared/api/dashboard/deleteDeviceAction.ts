"use server"
import { connectToDatabase } from "@/shared/lib/dbConnect";
import Device from "@/entities/device/Device";
import { revalidateTag } from "next/cache";

const deleteDeviceAction = async (id: string) => {
  try {
    await connectToDatabase();
    await Device.findByIdAndDelete(id);
    revalidateTag('/admin/devices');
    return { status: "success", message: "Устройство удалено" };
  } catch (error) {
    console.error("Error deleting device:", error);
    return { status: "error", message: (error as { message: string }).message || "Внутренняя ошибка сервера." };
  }
};

export { deleteDeviceAction };
