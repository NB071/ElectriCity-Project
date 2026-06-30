import APP_CONSTANTS from "../configs/constants.js";
import { z } from "zod";

// schema definition(s)
const paginationParamsSchema = z.object({
    page: z.coerce
        .number()
        .int()
        .positive()
        .default(APP_CONSTANTS.pagination.DEFAULT_PAGE),
    limit: z.coerce
        .number()
        .int()
        .positive()
        .max(APP_CONSTANTS.pagination.MAX_LIMIT)
        .default(APP_CONSTANTS.pagination.DEFAULT_LIMIT),
});

/**
 * This function parses a value as a positive integer.
 * @helper_function
 * @private
 * @param {string} value The value to parse
 * @returns {number|null} The parsed value
 */
function positiveInt(value) {
    const n = Number.parseInt(value, 10);
    return n > 0 ? n : null;
}

/**
 * This function parses the pagination query.
 * @helper_function
 * @param {object} query The query object
 * @returns {object} The parsed query
 */
function parsePaginationQuery(query = {}) {
    const page =
        positiveInt(query.page) ?? APP_CONSTANTS.pagination.DEFAULT_PAGE;
    const limit = Math.min(
        positiveInt(query.limit) ?? APP_CONSTANTS.pagination.DEFAULT_LIMIT,
        APP_CONSTANTS.pagination.MAX_LIMIT,
    );

    return {
        page,
        limit,
        offset: (page - 1) * limit,
    };
}

/**
 * This function generates the pagination metadata.
 * @helper_function
 * @param {object} params { page: number, limit: number, total: number }
 * @returns {object} The pagination metadata
 */
function paginationMeta(params) {
    const { page, limit, total } = params;
    const totalPages = Math.ceil(total / limit) || 0;

    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}

/**
 * This function validates pagination query parameters.
 * @helper_function
 * @param {object} params The pagination parameters to validate
 * @returns {boolean} True if the pagination parameters are valid, false otherwise
 */
function validatePaginationParams(params) {
    return paginationParamsSchema.safeParse(params).success;
}

export { parsePaginationQuery, paginationMeta, validatePaginationParams };
