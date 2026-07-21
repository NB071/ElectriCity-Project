import { z } from "zod";

export const accountFormSchema = z.object({
    first_name: z.string().min(1, "First name is required.").max(50, "Name must not be longer than 50 characters."),
    last_name: z.string().min(1, "Last name is required.").max(50, "Name must not be longer than 50 characters."),
    email: z.email("Please enter a valid email address."),
    phone_number: z.string().optional(),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
