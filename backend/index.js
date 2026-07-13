import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import getPool, { dbConfig } from "./configs/db.js";
import getRedisClient, { redisConfig } from "./configs/redis.js";
import env from "./configs/env.js";
import path from "node:path";
import http from "http";
import { fileURLToPath } from "node:url";
import { startWorkers } from "./services/queue/queue.service.js";
import {
    loadActiveEventTypes,
    subscribeToEventTypeChanges,
} from "./services/analytics/analyticsCache.js";

// Routes - import
import authRoute from "./routes/api/auth/index.js";
import dashboardRoute from "./routes/api/dashboard/index.js";
import shopRoute from "./routes/api/shop/index.js";

// Middlewares - import
import {
    errorHandlerMiddleware,
    helmetMiddleware,
} from "./middlewares/index.js";
import {
    authRateLimiter,
    dashboardRateLimiter,
    shopRateLimiter,
} from "./middlewares/rateLimit.middleware.js";
import { AppError } from "./utils/errors.js";
import log from "./utils/logger.js";
import { CART_HEADERS } from "./services/cart/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);

// ------- Middlewares -------
// > Middlewares (security)
app.disable("x-powered-by");
app.use(helmetMiddleware);
app.use(
    cors({
        origin: true,
        credentials: true,
        exposedHeaders: [CART_HEADERS.SESSION],
    }),
);

// > Middlewares (Server)
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ------- Routes -------
// > Routes (/api)
app.use("/api/auth", authRateLimiter, authRoute);
app.use("/api/dashboard", dashboardRateLimiter, dashboardRoute);
app.use("/api/shop", shopRateLimiter, shopRoute);

// ------- Global error handler -------
// Registration of Sentry.
Sentry.setupExpressErrorHandler(app, {
    // Log errors with status code >= 500.
    shouldHandleError(error) {
        if (error instanceof AppError) {
            return Number(error.status) >= 500;
        }

        // if the error is not an AppError (Error class), check if there's a status code property and if it's >= 500.
        // if there's no status code property, set it to 500 by default and log
        const status = error?.status || error?.statusCode || 500;
        return Number(status) >= 500;
    },
});
app.use(errorHandlerMiddleware);

// ------- Startup -------
async function checkDatabase() {
    await getPool();
    log.info(
        "Main",
        "checkDatabase",
        `Database connection verified (${dbConfig.host}:${dbConfig.port}/${dbConfig.database})`,
    );
}

async function checkRedis() {
    await getRedisClient();
    log.info(
        "Main",
        "checkRedis",
        `Redis connection verified (${redisConfig.host}:${redisConfig.port})`,
    );
}

function checkJwtConfig() {
    if (!env.jwt.JWT_SIGN_KEY) {
        throw new AppError(
            "JWT_SIGN_KEY is missing. Please set it in .env before starting the server.",
        );
    }
}

(async () => {
    try {
        checkJwtConfig();

        // Connection checks
        await checkDatabase();
        await checkRedis();

        // Analytics Service
        await loadActiveEventTypes(); // Load active event types from the database.
        await subscribeToEventTypeChanges(); // Subscribe to event type changes in Redis.

        // Queue Service
        startWorkers(); // Start all queue workers.
    } catch (error) {
        log.error("Main", "startup", "Startup failed", error);
        Sentry.captureException(error);
        await Sentry.flush(2000);
        process.exit(1);
    }

    server.listen(
        Number(env.server.PORT),
        String(env.server.LOCAL_ADDRESS),
        () => {
            log.info(
                "Main",
                "listen",
                `Server is running on ${env.server.LOCAL_ADDRESS}:${env.server.PORT}`,
            );
        },
    );
})();
