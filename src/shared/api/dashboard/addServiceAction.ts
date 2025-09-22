"use server"
import { connectToDatabase } from "@/shared/lib/dbConnect";
import Service from "@/entities/service/Service";
import { revalidateTag } from "next/cache";

const addServiceAction = async (category: string, name: string, cost: number, duration: string) => {
  try {
    await connectToDatabase();
    const service = new Service({ category, name, cost, duration });
    await service.save();
    revalidateTag('/admin/services');
    return { status: "success", message: "Service created" };
  } catch (error) {
    console.error("Error adding service:", error);
    return { status: "error", message: (error as { message: string }).message || "Internal server error." };
  }
};

export default addServiceAction;
