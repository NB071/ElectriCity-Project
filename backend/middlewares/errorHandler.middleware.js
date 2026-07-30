// Inspired by: https://javascript.plainenglish.io/how-i-set-up-a-global-error-handler-in-express-js-and-why-you-should-too-800d80770cce (article)

import apiResponse from "../utils/apiResponse.js";
import { AppError } from "../utils/errors.js";
import log from "../utils/logger.js";

/**
 * Global Express error handler. Keeps JSON shape.
 * This includes Sentry event id when present.
 * @param {Error} err The error to handle.
 * @param {import('express').Request} _req The request object.
 * @param {import('express').Response} res The response object.
 * @param {import('express').NextFunction} _next The next function.
 */
function errorHandlerMiddleware(err, _req, res, _next) {
    log.error(
        "Middleware",
        "errorHandler",
        "Error handler middleware called",
        err,
    );

    const errStatus =
        err instanceof AppError
            ? err.status
            : err.status || err.statusCode || 500;
    const isServerError = errStatus >= 500;
    const isDevelopment = process.env.NODE_ENV === "development";
    const errMsg =
        isServerError && !isDevelopment
            ? "Internal server error"
            : err.message || "Something went wrong";
    const errCode = err instanceof AppError ? err.code : "INTERNAL_ERROR";

    const errorDetails = {
        message: errMsg,
        code: errCode,
        details:
            (!isServerError || isDevelopment) && err instanceof AppError
                ? err.details
                : null,
        stack: isDevelopment ? err.stack : null,
        // Set by Sentry.setupExpressErrorHandler when the error was reported
        sentry_event_id: res.sentry || null,
    };

    apiResponse(res, errorDetails, errStatus);
}

export default errorHandlerMiddleware;
