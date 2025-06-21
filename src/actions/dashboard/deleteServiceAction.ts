"use server"
import { connectToDatabase } from "@/lib/dbConnect";
import Service from "@/models/Service";
import { revalidateTag } from "next/cache";

const deleteServiceAction = async (id: string) => {
  try {
    await connectToDatabase();
    await Service.findByIdAndDelete(id);
    revalidateTag('/admin/services');
    return { status: "success", message: "Service deleted" };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { status: "error", message: (error as { message: string }).message || "Internal server error." };
  }
};

export default deleteServiceAction;
