import { envSchema } from "@/zod/env";

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.format());
    throw new Error("Invalid environment variables. Check your .env file.");
}

export const env = parsedEnv.data;

/**
 * Helper to dynamically resolve the API base url depending on the current environment format.
 */
export function getApiBaseUrl(): string {
    const base = env.VITE_ENVIRONMENT === "development" ? env.VITE_DEV_API_URL : env.VITE_PROD_API_URL;
    return base.replace(/\/$/, "");
}
