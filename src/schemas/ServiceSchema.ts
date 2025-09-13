import { z } from "zod";

export const ServiceSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1).max(100),
  cost: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, { message: "Cost must be positive" }),
  duration: z.string().optional(),
});

export type ServiceFormData = z.infer<typeof ServiceSchema>;