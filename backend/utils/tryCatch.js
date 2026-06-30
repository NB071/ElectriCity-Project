// Design Pattern / Technique: Decorator pattern / Higher-Order Function
// Inspired by: https://javascript.plainenglish.io/how-i-set-up-a-global-error-handler-in-express-js-and-why-you-should-too-800d80770cce (article)

import apiResponse from "./apiResponse.js";
import { AppError } from "./errors.js";

/**
 * This High-oder function acts as a wrapper for all controller functions.
 * @helper_function
 * @private
 * @param {function} controller Controller function
 * @returns {function} Wrapped controller function
 */
const tryCatch = (controller) => async (req, res, next) => {
    try {
        return await controller(req, res, next);
    } catch (error) {
        if (error instanceof AppError) {
            const data = {
                code: error.code,
                message: error.message,
            };

            if (error.details != null) {
                data.details = error.details;
            }

            return apiResponse(res, data, error.status);
        }

        return next(error);
    }
};

export default tryCatch;
