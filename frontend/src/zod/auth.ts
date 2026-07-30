import { z } from "zod";

export const loginSchema = z.object({
    email: z.email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters.").max(100, "First name cannot exceed 100 characters."),
    lastName: z.string().min(2, "Last name must be at least 2 characters.").max(100, "Last name cannot exceed 100 characters."),
    email: z.email({ message: "Please enter a valid email address." }).max(255, "Email cannot exceed 255 characters."),
    phone: z.string().max(20, "Phone number cannot exceed 20 characters.").optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters.").max(100, "Password is too long."),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
