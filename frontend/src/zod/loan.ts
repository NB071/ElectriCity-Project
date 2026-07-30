import { z } from "zod";

export const loanSchema = z.object({
    price: z
        .string()
        .min(1, "Price is required")
        .max(15, "Value is too large")
        .regex(/^\d+(\.\d*)?$/, "Must be a positive number"),
    rate: z
        .string()
        .min(1, "Rate is required")
        .max(5, "Rate is too large")
        .regex(/^\d+(\.\d*)?$/, "Must be a positive number"),
    period: z.string().min(1, "Period is required").max(3, "Period is too long").regex(/^\d+$/, "Must be a whole number"),
    down: z
        .string()
        .min(1, "Down payment is required")
        .max(15, "Value is too large")
        .regex(/^\d+(\.\d*)?$/, "Must be a positive number"),
});

export type LoanFormData = z.infer<typeof loanSchema>;
