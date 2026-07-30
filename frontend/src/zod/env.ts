import { z } from "zod";

export const envSchema = z.object({
    VITE_ENVIRONMENT: z.enum(["development", "production", "test"]).default("development"),
    VITE_VERSION: z.string().default("1.0.0"),
    VITE_DEV_API_URL: z.url().default("http://localhost:8080"),
    VITE_PROD_API_URL: z.url().default("https://api.project-electricity.app"),
    VITE_STORAGE_SECRET: z.string().min(8),
});

export type EnvConfig = z.infer<typeof envSchema>;
