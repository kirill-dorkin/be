"use server"
import { connectToDatabase } from "@/lib/dbConnect";
import Category from "@/models/Category";
import { revalidateTag } from "next/cache";

const deleteCategoryAction = async (id: string) => {
  try {
    await connectToDatabase();
    await Category.findByIdAndDelete(id);
    revalidateTag('/admin/categories');
    return { status: "success", message: "Category deleted" };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { status: "error", message: (error as { message: string }).message || "Internal server error." };
  }
};

export default deleteCategoryAction;
