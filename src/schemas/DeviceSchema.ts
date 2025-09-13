import { z } from "zod";

export const DeviceSchema = z.object({
  category: z.string().min(1),
  brand: z.string().min(1).max(100),
  deviceModel: z.string().optional(),
});

export type DeviceFormData = z.infer<typeof DeviceSchema>;