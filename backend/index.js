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
import { errorHandlerMiddleware } from "./middlewares/index.js";
import {
    authRateLimiter,
    dashboardRateLimiter,
    shopRateLimiter,
} from "./middlewares/rateLimit.middleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);

// ------- Middlewares -------
// > Middlewares (Server)
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// > Middlewares (security)
app.disable("x-powered-by");
app.use(cors());
// TODO: Implement more security middlewares [helmet, express-validator]

// ------- Routes -------
// > Routes (/api)
app.use("/api/auth", authRateLimiter, authRoute);
app.use("/api/dashboard", dashboardRateLimiter, dashboardRoute);
app.use("/api/shop", shopRateLimiter, shopRoute);

// ------- Global error handler -------
app.use(errorHandlerMiddleware);

// ------- Startup -------
async function checkDatabase() {
    await getPool();
    console.log(
        `Database connection verified (${dbConfig.host}:${dbConfig.port}/${dbConfig.database})`,
    );
}

async function checkRedis() {
    await getRedisClient();
    console.log(
        `Redis connection verified (${redisConfig.host}:${redisConfig.port})`,
    );
}

(async () => {
    try {
        // Connection checks
        await checkDatabase();
        await checkRedis();

        // Analytics Service
        await loadActiveEventTypes(); // Load active event types from the database.
        await subscribeToEventTypeChanges(); // Subscribe to event type changes in Redis.

        // Queue Service
        startWorkers(); // Start all queue workers.
    } catch (error) {
        console.error("[Main] Startup failed:", error.message);
        process.exit(1);
    }

    server.listen(
        Number(env.server.PORT),
        String(env.server.LOCAL_ADDRESS),
        () => {
            console.log(
                `Server is running on ${env.server.LOCAL_ADDRESS}:${env.server.PORT}`,
            );
        },
    );
})();
