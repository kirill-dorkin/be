"use server"
import { connectToDatabase } from "@/shared/lib/dbConnect";
import Category from "@/entities/category/Category";
import { serializeData } from "@/shared/lib/utils";

const getCategoriesAction = async (page: number = 1, limit: number = 5) => {
  try {
    const skip = (page - 1) * limit;
    await connectToDatabase();
    const categories = await Category.find().skip(skip).limit(limit).lean();
    const totalItemsLength = await Category.countDocuments();
    return { status: "success", items: serializeData(categories), totalItemsLength };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { status: "error", message: (error as { message: string }).message || "Внутренняя ошибка сервера." };
  }
};

export { getCategoriesAction };
