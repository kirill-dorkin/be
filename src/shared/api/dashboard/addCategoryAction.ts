"use server"
import { connectToDatabase } from "@/shared/lib/dbConnect";
import Category from "@/entities/category/Category";
import { revalidateTag } from "next/cache";

const addCategoryAction = async (name: string) => {
  try {
    await connectToDatabase();
    const category = new Category({ name });
    await category.save();
    revalidateTag('/admin/categories');
    return { status: "success", message: "Category created" };
  } catch (error) {
    console.error("Error adding category:", error);
    return { status: "error", message: (error as { message: string }).message || "Internal server error." };
  }
};

export default addCategoryAction;
