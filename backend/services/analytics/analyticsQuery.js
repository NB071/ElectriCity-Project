// Analytics Service
// CQRS - Query side (reports)

import analyticsDAO from "./analyticsDAO.js";
import { validateReportParams, validateEventId } from "./analyticsValidator.js";
import log from "../../utils/logger.js";

/**
 * This function parses the metadata of an event.
 * @helper_function
 * @private
 * @param {object} meta The metadata of an event
 * @returns {object} The parsed metadata
 */
function parseMeta(meta) {
    if (meta == null) {
        return {};
    }

    if (typeof meta === "string") {
        return JSON.parse(meta);
    }

    return meta;
}

/**
 * This function maps the event details to a readable format.
 * @helper_function
 * @private
 * @param {object} row The event details
 * @returns {object} The event details in a readable format
 */
function mapEventDetail(row) {
    const meta = parseMeta(row.meta);

    let cid = null;
    if (row.cid != null) {
        cid = {
            cid: row.cid,
            item_type: row.item_type,
            base_price: row.base_price,
            quantity: row.quantity,
            is_active: Boolean(row.is_active),
            brand: row.brand_name,
            model: row.model_name,
            model_type: row.model_type,
        };

        if (row.vehicle_year != null || row.vehicle_condition != null) {
            cid.vehicle = {
                year: row.vehicle_year,
                condition: row.vehicle_condition,
                mileage: row.vehicle_mileage,
            };
        }
    }

    return {
        event_id: row.event_id,
        event_code: row.event_code,
        event_type_name: row.event_type_name,
        user_id: row.user_id,
        cid,
        meta,
        ip: row.ip_address,
        generated_at: row.created_at,
    };
}

/**
 * This function returns the total event counts grouped by type over a window.
 * @param {object} params The report parameters
 * @param {string} params.start The start date of the window
 * @param {string} params.end The end date of the window
 * @param {number} params.limit The limit of the event counts
 * @returns {Promise<object[]>} The total event counts grouped by type over a window
 * @throws {ValidationError} If the report parameters are invalid
 * @throws {DatabaseError} On database failures
 */
async function eventTypeBreakdown(params = {}) {
    const { start, end, limit } = validateReportParams(params);
    try {
        return await analyticsDAO.countByEventType(start, end, limit);
    } catch (err) {
        log.error(
            "Analytics",
            "eventTypeBreakdown",
            "eventTypeBreakdown failed",
            err,
        );
        throw err;
    }
}

/**
 * This function returns the top-N catalog items for a given event type.
 * @param {number} eventTypeId The event type ID
 * @param {object} params The report parameters
 * @param {string} params.start The start date of the window
 * @param {string} params.end The end date of the window
 * @param {number} params.limit The limit of the event counts
 * @returns {Promise<object[]>}
 * @throws {ValidationError} If the report parameters are invalid
 * @throws {DatabaseError} On database failures
 */
async function topCatalogItems(eventTypeId, params = {}) {
    try {
        const { start, end, limit } = validateReportParams(params);
        return await analyticsDAO.topCatalogItemsByEvent(
            eventTypeId,
            start,
            end,
            limit,
        );
    } catch (err) {
        log.error(
            "Analytics",
            "topCatalogItems",
            "topCatalogItems failed",
            err,
        );
        throw err;
    }
}

/**
 * This function returns the daily time-series for a given event type.
 * @param {number} eventTypeId
 * @param {object} params The report parameters
 * @param {string} params.start The start date of the window
 * @param {string} params.end The end date of the window
 * @returns {Promise<object[]>} The daily time-series for a given event type
 * @throws {ValidationError} If the report parameters are invalid
 * @throws {DatabaseError} On database failures
 */
async function trend(eventTypeId, params = {}) {
    try {
        const { start, end } = validateReportParams(params);
        return await analyticsDAO.dailyTrend(eventTypeId, start, end);
    } catch (err) {
        log.error("Analytics", "trend", "trend failed", err);
        throw err;
    }
}

/**
 * Fetches one event log with event type name/code and optional catalog details.
 * @param {number|string} eventId
 * @returns {Promise<object>}
 * @throws {ValidationError} If the event id is invalid
 * @throws {DatabaseError} On database failures
 * @throws {NotFoundError} If the event is not found
 */
async function eventDetail(eventId) {
    try {
        const id = validateEventId(eventId);
        const row = await analyticsDAO.findEventById(id);
        return mapEventDetail(row);
    } catch (err) {
        log.error("Analytics", "eventDetail", "eventDetail failed", err);
        throw err;
    }
}

export { eventTypeBreakdown, topCatalogItems, trend, eventDetail };
