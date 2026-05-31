// Resource: https://nodejs.org/api/http.html#httpstatus_codes (Node.js HTTP Status Codes)
// Inspired by: https://npmx.dev/package/express-api-utils/v/1.0.4

import { STATUS_CODES } from "node:http";

// This function standardizes the response format for all API responses.
function apiResponse(res, data = null, statusCode = 200) {
    const success = statusCode < 400;

    return res.status(statusCode).json({
        success,
        status: `${statusCode} ${STATUS_CODES[statusCode]}`,
        data,
        timestamp: new Date().toISOString(),
    });
}

export default apiResponse;
