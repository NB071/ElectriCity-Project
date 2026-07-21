// Analytics/Track Service
// CQRS - Mutations (Track)

import TrackDAO from "./trackDAO.js";
import { validateEvent } from "./trackValidator.js";
import { isEventActive } from "../analyticsCache.js";
import { REDIS } from "../constants.js";
import getRedisClient from "../../../configs/redis.js";
import log from "../../../utils/logger.js";

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
    return await TrackDAO.insertEvent(valid);
  } catch (err) {
    log.error("Analytics", "capture", "capture failed", err);
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
    await TrackDAO.updateEventTypeActive(eventTypeId, isActive);
    const client = await getRedisClient();
    await client.publish(REDIS.CACHE_CHANNEL, String(eventTypeId));
  } catch (err) {
    log.error(
      "Analytics",
      "setEventTypeActive",
      "setEventTypeActive failed",
      err,
    );
    throw err;
  }
}

export { capture, setEventTypeActive };
