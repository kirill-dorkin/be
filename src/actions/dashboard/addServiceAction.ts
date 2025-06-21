"use server"
import { connectToDatabase } from "@/lib/dbConnect";
import Service from "@/models/Service";
import { revalidateTag } from "next/cache";

const addServiceAction = async (device: string, name: string, cost: number) => {
  try {
    await connectToDatabase();
    const service = new Service({ device, name, cost });
    await service.save();
    revalidateTag('/admin/services');
    return { status: "success", message: "Service created" };
  } catch (error) {
    console.error("Error adding service:", error);
    return { status: "error", message: (error as { message: string }).message || "Internal server error." };
  }
};

export default addServiceAction;
