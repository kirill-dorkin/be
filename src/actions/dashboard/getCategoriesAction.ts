"use server"
import { connectToDatabase } from "@/lib/dbConnect";
import Category from "@/models/Category";
import { serializeData } from "@/lib/utils";

const getCategoriesAction = async (page: number = 1, limit: number = 5) => {
  try {
    const skip = (page - 1) * limit;
    await connectToDatabase();
    const categories = await Category.find().skip(skip).limit(limit).lean();
    const totalItemsLength = await Category.countDocuments();
    return { status: "success", items: serializeData(categories), totalItemsLength };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { status: "error", message: (error as { message: string }).message || "Internal server error." };
  }
};

export default getCategoriesAction;
