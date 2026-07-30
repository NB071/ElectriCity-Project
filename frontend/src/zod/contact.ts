import { z } from "zod";

export const contactSchema = z.object({
    firstName: z.string({ error: "First Name is required" }).min(1, "First Name is required"),
    lastName: z.string({ error: "Last Name is required" }).min(1, "Last Name is required"),
    email: z.email("Invalid email address"),
    phone: z.string().optional(),
    comment: z.string({ error: "Comment is required" }).min(1, "Comment is required").max(1000, "Comment must be at most 1000 characters long"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
