import { z } from "zod";

export const addressSchema = z.object({
    street: z.string().min(3, "Street is too short").max(255),
    city: z.string().min(2, "City is too short").max(100),
    province: z.string().min(2, "Province is too short").max(100),
    country: z.string().min(2, "Country is too short").max(100),
    postal_code: z.string().min(3).max(20),
    is_default: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
