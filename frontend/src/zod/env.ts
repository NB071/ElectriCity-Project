import { z } from "zod";

const booleanFromEnv = z.preprocess((value) => {
    if (typeof value === "boolean") return value;
    if (value == null || value === "") return false;
    return value === "true" || value === "1";
}, z.boolean());

const sampleRateFromEnv = z.coerce.number().min(0).max(1);

export const envSchema = z.object({
    VITE_ENVIRONMENT: z.enum(["development", "production", "test"]).default("development"),
    VITE_VERSION: z.string().default("1.0.0"),
    VITE_DEV_API_URL: z.url().default("http://localhost:8080"),
    VITE_PROD_API_URL: z.url().default("https://api.project-electricity.app"),
    VITE_STORAGE_SECRET: z.string().min(8),

    // Sentry (browser). API 5xx are reported by the backend; this covers frontend runtime errors.
    VITE_SENTRY_ENABLED: booleanFromEnv.default(false),
    VITE_SENTRY_DSN: z.string().optional().default(""),
    VITE_SENTRY_DEV_TRACES_SAMPLE_RATE: sampleRateFromEnv.default(1.0),
    VITE_SENTRY_PROD_TRACES_SAMPLE_RATE: sampleRateFromEnv.default(0.1),
});

export type EnvConfig = z.infer<typeof envSchema>;
