import { z } from "zod";

import { REPAIR_ROLE } from "@/lib/repair/metadata";

export const applyFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "errors.firstName.min")
    .max(120, "errors.firstName.max"),
  lastName: z
    .string()
    .min(2, "errors.lastName.min")
    .max(120, "errors.lastName.max"),
  email: z.string().email("errors.email.invalid"),
  phone: z.string().min(5, "errors.phone.min").max(40, "errors.phone.max"),
  password: z
    .string()
    .min(6, "errors.password.min")
    .max(120, "errors.password.max"),
  role: z.enum([REPAIR_ROLE.worker, REPAIR_ROLE.courier]),
});

export type ApplyFormValues = z.output<typeof applyFormSchema>;
