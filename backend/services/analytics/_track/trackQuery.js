// Analytics/Track Service
// CQRS - Query side (Track)

import TrackDAO from "./trackDAO.js";
import {
    validateReportParams,
    validateEventId,
    validateEventListParams,
} from "./trackValidator.js";
import log from "../../../utils/logger.js";
import { ValidationError } from "../../../utils/errors.js";
import {
    parsePaginationQuery,
    paginationMeta,
    validatePaginationParams,
} from "../../../utils/pagination.js";

import { toEventDetailDTO } from "./DTOs/eventDetailDTO.js";
import { toEventListItemDTO } from "./DTOs/eventListItemDTO.js";
import { toEventTypeBreakdownDTO } from "./DTOs/eventTypeBreakdownDTO.js";
import { toEventTypeListItemDTO } from "./DTOs/eventTypeListItemDTO.js";
import { toTopCatalogItemDTO } from "./DTOs/topCatalogItemDTO.js";
import { toDailyTrendDTO } from "./DTOs/dailyTrendDTO.js";

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
        const rows = await TrackDAO.countByEventType(start, end, limit);
        return rows.map(toEventTypeBreakdownDTO);
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
        const rows = await TrackDAO.topCatalogItemsByEvent(
            eventTypeId,
            start,
            end,
            limit,
        );
        return rows.map(toTopCatalogItemDTO);
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
        const rows = await TrackDAO.dailyTrend(eventTypeId, start, end);
        return rows.map(toDailyTrendDTO);
    } catch (err) {
        log.error("Analytics", "trend", "trend failed", err);
        throw err;
    }
}

/**
 * This function returns a paginated list of event logs for admin review.
 * @param {object} [queryParams] Raw query params from req.query
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {ValidationError} If filters or pagination parameters are invalid
 * @throws {DatabaseError} On database failures
 */
async function listEvents(queryParams = {}) {
    try {
        const filters = validateEventListParams(queryParams);

        if (!validatePaginationParams(queryParams)) {
            throw new ValidationError("Invalid pagination parameters.");
        }

        const pagination = parsePaginationQuery(queryParams);
        const total = await TrackDAO.countEvents(filters);
        const rows =
            total === 0
                ? []
                : await TrackDAO.findEvents(
                      filters,
                      pagination.limit,
                      pagination.offset,
                  );

        return {
            items: rows.map(toEventListItemDTO),
            pagination: paginationMeta({ ...pagination, total }),
        };
    } catch (err) {
        log.error("Analytics", "listEvents", "listEvents failed", err);
        throw err;
    }
}

/**
 * This function returns all event types with their tracking status.
 * @returns {Promise<object[]>}
 * @throws {DatabaseError} On database failures
 * @throws {NotFoundError} If there are no event types
 */
async function listEventTypes() {
    try {
        const rows = await TrackDAO.findAllEventTypes();
        return rows.map(toEventTypeListItemDTO);
    } catch (err) {
        log.error("Analytics", "listEventTypes", "listEventTypes failed", err);
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
        const row = await TrackDAO.findEventById(id);
        return toEventDetailDTO(row);
    } catch (err) {
        log.error("Analytics", "eventDetail", "eventDetail failed", err);
        throw err;
    }
}

export {
    eventTypeBreakdown,
    topCatalogItems,
    trend,
    listEvents,
    listEventTypes,
    eventDetail,
};
