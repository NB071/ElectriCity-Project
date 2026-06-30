// Resource: https://nodejs.org/api/http.html#httpstatus_codes (Node.js HTTP Status Codes)
// Inspired by: https://npmx.dev/package/express-api-utils/v/1.0.4

import { STATUS_CODES } from "node:http";

/**
 * This function standardizes the response format for all API responses.
 * @helper_function
 * @private
 * @param {object} res Express response object
 * @param {object} data The data to be sent in the response
 * @param {number} [statusCode=200] The status code of the response
 * @returns {void}
 */
function apiResponse(res, data = null, statusCode = 200) {
    const success = statusCode < 400;
    res.status(statusCode).json({
        success,
        status: `${statusCode} ${STATUS_CODES[statusCode]}`,
        data,
        timestamp: new Date().toISOString(),
    });
}

export default apiResponse;
