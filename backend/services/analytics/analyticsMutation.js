// Analytics Service
// CQRS - Mutations

import analyticsDAO from "./analyticsDAO.js";
import { validateEvent } from "./analyticsValidator.js";
import { isEventActive } from "./analyticsCache.js";
import { REDIS } from "./constants.js";
import getRedisClient from "../../configs/redis.js";

/**
 * This function captures an event.
 * This is exposed to services
 * @param {object} eventData The event data to capture
 * @param {number} eventData.event_type_id The event type ID
 * @param {number} eventData.user_id The user ID
 * @param {number} eventData.cid The catalog item ID
 * @param {string} eventData.ip_address The IP address of the user
 * @param {object} eventData.meta The metadata of the event
 * @returns {Promise<number|null>} The inserted event record's primary key, or null if inactive
 * @throws {ValidationError} If the event data is invalid
 * @throws {DatabaseError} On database failures
 * @throws {NotFoundError} If the event type is not found
 */
async function capture(event) {
    try {
        if (!isEventActive(event.event_type_id)) {
            return null;
        }

        const valid = validateEvent(event);
        return await analyticsDAO.insertEvent(valid);
    } catch (err) {
        console.error("[Service: Analytics] capture failed:", err.message);
        throw err;
    }
}

/**
 * This function sets the active status of an event type.
 * @param {number} eventTypeId The event type ID
 * @param {boolean} isActive The active status of the event type
 * @returns {Promise<void>}
 * @throws {DatabaseError} On database failures
 * @throws {NotFoundError} If the event type is not found
 */
async function setEventTypeActive(eventTypeId, isActive) {
    try {
        await analyticsDAO.updateEventTypeActive(eventTypeId, isActive);
        const client = await getRedisClient();
        await client.publish(REDIS.CACHE_CHANNEL, String(eventTypeId));
    } catch (err) {
        console.error(
            "[Service: Analytics] setEventTypeActive failed:",
            err.message,
        );
        throw err;
    }
}

export { capture, setEventTypeActive };
