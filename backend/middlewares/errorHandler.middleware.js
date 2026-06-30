// Inspired by: https://javascript.plainenglish.io/how-i-set-up-a-global-error-handler-in-express-js-and-why-you-should-too-800d80770cce (article)

import apiResponse from "../utils/apiResponse.js";
function errorHandlerMiddleware(err, _req, res, _next) {
    console.error(
        "[Middleware: Error Handler] Error handler middleware called:",
        err,
    );

    const errStatus = err.status || 500;
    const errMsg = err.message || "Something went wrong";

    const errorDetails = {
        success: false,
        status: errStatus,
        message: errMsg,
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
    };

    apiResponse(res, errorDetails, errStatus);
}

export default errorHandlerMiddleware;
