// Library: express-rate-limit
// Docs URL: https://www.npmjs.com/package/express-rate-limit

/*
* The purpose of this middleware is to limit the number of requests to the server.
* Protection against: DDOS attacks, brute force attacks, etc.

* Note: Limit is placed per IP address.
*/

import { rateLimit } from "express-rate-limit";
import { TooManyRequestsError } from "../utils/errors.js";

function constructRateLimiter({ windowMs, max, msg }) {
    return rateLimit({
        windowMs,
        limit: max,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        handler: (req, res, next, options) => {
            const retryAfterSeconds = Math.ceil(options.resetTime / 1000);
            next(
                new TooManyRequestsError(msg, {
                    retryAfter: retryAfterSeconds,
                }),
            );
        },
    });
}

// Rate Limits per high-order endpoints
// > Auth Routes
const authRateLimiter = constructRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    msg: "Too many login attempts, please try again later.",
});

// > Dashboard Routes
const dashboardRateLimiter = constructRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    msg: "Too many dashboard requests, please try again later.",
});

// > Shop Routes
const shopRateLimiter = constructRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 200, // 200 requests per minute
    msg: "Too many shop requests, please try again later.",
});

// > Chatbot (Gemini calls are expensive)
const chatbotRateLimiter = constructRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 messages per minute
    msg: "Too many chatbot messages, please try again later.",
});

export {
    authRateLimiter,
    dashboardRateLimiter,
    shopRateLimiter,
    chatbotRateLimiter,
};
