// Inspired by: https://github.com/GonzaloHirsch/jwt-nodejs-security/blob/main/src/config/index.ts

/* 
    This file loads environment variables from .env file and makes them accessible throughout the application.
    Exports them as an object to facilitate/standardize access.
    Everything that comes from '.env' & changes between environments (dev, prod, etc.) should be here.

    NOTE: default values are captured through constants.js; considered as app-level fallback values.
*/

import dotenv from "dotenv";
import APP_CONSTANTS from "./constants.js";

const { parsed } = dotenv.config();

if (parsed?.NODE_ENV) {
    process.env.NODE_ENV = parsed.NODE_ENV.trim();
}

const nodeEnv = (
    process.env.NODE_ENV || APP_CONSTANTS.APP.DEFAULT_NODE_ENV
).trim();
const isDev = nodeEnv === "development";

export default {
    app: {
        NODE_ENV: nodeEnv,
        LOG_LEVEL: (
            process.env.LOG_LEVEL || APP_CONSTANTS.APP.DEFAULT_APP_LOG_LEVEL
        ).trim(),
    },
    db: {
        DB_HOST: process.env.DB_HOST,
        DB_LOCAL_DBNAME: process.env.DB_LOCAL_DBNAME,
        DB_LOCAL_USER: process.env.DB_LOCAL_USER,
        DB_LOCAL_PASSWORD: process.env.DB_LOCAL_PASSWORD,
    },
    jwt: {
        JWT_SIGN_KEY: process.env.JWT_SIGN_KEY,
    },
    server: {
        PORT: process.env.PORT,
        LOCAL_ADDRESS: process.env.LOCAL_ADDRESS,
    },
    email: {
        host: process.env.EMAIL_HOST,
        port:
            parseInt(process.env.EMAIL_PORT) ||
            APP_CONSTANTS.EMAIL.DEFAULT_PORT,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM,
        secure: process.env.SMTP_SECURE,
    },
    redis: {
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT:
            parseInt(process.env.REDIS_PORT) ||
            APP_CONSTANTS.REDIS.DEFAULT_PORT,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    },
    ai: {
        apiKey: (
            process.env.GEMINI_API_KEY ??
            process.env.GOOGLE_API_KEY ??
            ""
        ).trim(),
        model: process.env.GEMINI_MODEL || APP_CONSTANTS.AI.DEFAULT_MODEL,
        maxToolRounds:
            parseInt(process.env.GEMINI_MAX_TOOL_ROUNDS, 10) ||
            APP_CONSTANTS.AI.DEFAULT_MAX_TOOL_ROUNDS,
        maxToolResultChars:
            parseInt(process.env.GEMINI_MAX_TOOL_RESULT_CHARS, 10) ||
            APP_CONSTANTS.AI.DEFAULT_MAX_TOOL_RESULT_CHARS,
        retryAttempts:
            parseInt(process.env.GEMINI_RETRY_ATTEMPTS, 10) ||
            APP_CONSTANTS.AI.DEFAULT_RETRY_ATTEMPTS,
        retryDelayMs:
            parseInt(process.env.GEMINI_RETRY_DELAY_MS, 10) ||
            APP_CONSTANTS.AI.DEFAULT_RETRY_DELAY_MS,
    },
    sentry: {
        SENTRY_DSN: process.env.SENTRY_DSN,
        SENTRY_TRACES_SAMPLE_RATE:
            parseFloat(
                isDev
                    ? process.env.SENTRY_DEV_TRACES_SAMPLE_RATE
                    : process.env.SENTRY_PROD_TRACES_SAMPLE_RATE,
            ) || APP_CONSTANTS.SENTRY.DEFAULT_TRACES_SAMPLE_RATE,
        SENTRY_PROFILE_SESSION_SAMPLE_RATE:
            parseFloat(
                isDev
                    ? process.env.SENTRY_DEV_PROFILE_SESSION_SAMPLE_RATE
                    : process.env.SENTRY_PROD_PROFILE_SESSION_SAMPLE_RATE,
            ) || APP_CONSTANTS.SENTRY.DEFAULT_PROFILE_SESSION_SAMPLE_RATE,
        SENTRY_ENABLED:
            process.env.SENTRY_ENABLED === "true" ||
            APP_CONSTANTS.SENTRY.DEFAULT_ENABLED,
    },
};
