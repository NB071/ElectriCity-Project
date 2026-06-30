/* Resources used:
 * https://github.com/redis/ioredis
 * https://docs.bullmq.io/guide/connections
 */

import Redis from "ioredis";
import env from "./env.js";

export const redisConfig = {
    host: env.redis.REDIS_HOST,
    port: env.redis.REDIS_PORT,
    password: env.redis.REDIS_PASSWORD,
};

let client = null;

async function getRedisClient() {
    if (client) {
        return client;
    }

    try {
        client = new Redis({
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            maxRetriesPerRequest: null,
        });

        await client.ping();

        console.log("Redis client ready");

        return client;
    } catch (error) {
        console.error("[Redis] Error connecting to Redis:", error);
        throw error;
    }
}

export default getRedisClient;
