import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import analyticsService from "../../../services/analytics/analytics.service.js";
import { parsePaginationQuery } from "../../../utils/pagination.js";

/**
 * This controller fetches the breakdown of event types.
 * @route GET /api/dashboard/admin/analytics/reports/breakdown
 * @required_role admin
 * @services_used Analytics
 */
export const getEventTypeBreakdown = tryCatch(async (req, res, _) => {
    const { limit } = parsePaginationQuery(req.query);
    const responseData = await analyticsService.eventTypeBreakdown({
        ...req.query,
        limit,
    });
    return apiResponse(res, responseData, 200);
});

/**
 * This controller fetches the trend of event types.
 * @route GET /api/dashboard/admin/analytics/reports/trend/:eventTypeId
 * @required_role admin
 * @services_used Analytics
 */
export const getTrend = tryCatch(async (req, res, _) => {
    const responseData = await analyticsService.trend(
        req.params.eventTypeId,
        req.query,
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller fetches the top catalog items of event types.
 * @route GET /api/dashboard/admin/analytics/reports/top-items/:eventTypeId
 * @required_role admin
 * @services_used Analytics
 */
export const getTopCatalogItems = tryCatch(async (req, res, _) => {
    const { limit } = parsePaginationQuery(req.query);
    const responseData = await analyticsService.topCatalogItems(
        req.params.eventTypeId,
        { ...req.query, limit },
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller fetches the detail of an event.
 * @route GET /api/dashboard/admin/analytics/events/:eventId
 * @required_role admin
 * @services_used Analytics
 */
export const getEventDetail = tryCatch(async (req, res, _) => {
    const responseData = await analyticsService.eventDetail(req.params.eventId);
    return apiResponse(res, responseData, 200);
});

/**
 * This controller sets the active status of an event type.
 * @route PATCH /api/dashboard/admin/analytics/event-types/:eventTypeId/active
 * @required_role admin
 * @services_used Analytics
 */
export const setEventTypeActive = tryCatch(async (req, res, _) => {
    const { is_active: isActive } = req.body;

    if (typeof isActive !== "boolean") {
        const error = new Error("is_active must be a boolean.");
        error.status = 400;
        throw error;
    }

    await analyticsService.setEventTypeActive(req.params.eventTypeId, isActive);

    const responseData = {
        event_type_id: Number(req.params.eventTypeId),
        is_active: isActive,
    };
    return apiResponse(res, responseData, 200);
});
