import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const TaskSchema = z.object({
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(255, { message: "Description must be less than 255 characters" }),
  customerName: z
    .string()
    .min(1, { message: "Customer name is required" })
    .max(100, { message: "Customer name must be less than 100 characters" }),
  customerPhone: z
    .string()
    .min(1, { message: "Customer phone is required" })
    .refine(isValidPhoneNumber, { message: "Invalid phone number" }),
  laptopBrand: z
    .string()
    .min(1, { message: "Laptop brand is required" })
    .max(100, { message: "Laptop brand must be less than 100 characters" }),
  laptopModel: z
    .string()
    .min(1, { message: "Laptop model is required" })
    .max(100, { message: "Laptop model must be less than 100 characters" }),
  totalCost: z
    .number()
    .min(0, { message: "Cost must be positive" }),
});

export type TaskFormData = z.infer<typeof TaskSchema>;