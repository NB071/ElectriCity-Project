// Analytics Service
// In-memory cache of active event types via Redis Pub/Sub

import analyticsDAO from "./analyticsDAO.js";
import getRedisClient from "../../configs/redis.js";
import { REDIS } from "./constants.js";

// Module-level Set for the single source the hot path reads from.
let activeIds = new Set();

/**
 * This function loads the active event type IDs from the database into the in-memory Set.
 * @returns {Promise<void>}
 * @throws {DatabaseError} On database failures
 * @throws {NotFoundError} If there's no active event type
 */
async function loadActiveEventTypes() {
    try {
        const rows = await analyticsDAO.findActiveEventTypeIds();
        activeIds = new Set(rows.map((r) => r.event_type_id));
    } catch (err) {
        console.error(
            "[Service: Analytics] loadActiveEventTypes failed:",
            err.message,
        );
        throw err;
    }
}

/**
 * This function checks if an event type is active.
 * @param {number} eventTypeId The event type ID
 * @returns {boolean} True if the event type is active, false otherwise
 */
function isEventActive(eventTypeId) {
    return activeIds.has(eventTypeId);
}

/**
 * Subscribes to the event-type cache invalidation channel.
 * Reloads the active Set immediately whenever an admin toggles is_active.
 * @returns {Promise<void>}
 * @throws {DatabaseError} On database failures
 * @throws {NotFoundError} If there's no active event type
 */
async function subscribeToEventTypeChanges() {
    const client = await getRedisClient();
    const subscriber = client.duplicate(); // sub mode blocks normal commands, needs own conn

    subscriber.on("message", async (channel) => {
        if (channel === REDIS.CACHE_CHANNEL) {
            try {
                await loadActiveEventTypes();
            } catch (err) {
                console.error(
                    "[Service: Analytics] cache reload failed:",
                    err.message,
                );
                throw err;
            }
        }
    });

    await subscriber.subscribe(REDIS.CACHE_CHANNEL);
}

export { loadActiveEventTypes, isEventActive, subscribeToEventTypeChanges };
