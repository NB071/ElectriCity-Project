// Analytics Service
// Express middleware for event capture

import { getProducer } from "../services/queue/queue.service.js";
import { QUEUES } from "../services/queue/constants.js";
import { isEventActive } from "../services/analytics/analyticsCache.js";
import log from "../utils/logger.js";

/**
 * This function resolves the catalog cid for analytics.
 * We prefer res.locals.cid (set by controllers when cid is not in params/body),
 * then route params, then request body.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {number|null} The catalog cid or null if not found
 */
function resolveCid(req, res) {
    // ordered list of candidates
    const candidates = [res.locals?.cid, req.params?.cid, req.body?.cid];

    // iterate over the candidates and return the first valid cid
    for (const value of candidates) {
        if (value == null || value === "") continue;
        const cid = Number(value);
        if (Number.isInteger(cid) && cid > 0) {
            return cid;
        }
    }

    return null;
}

/**
 * Returns middleware that enqueues the given event after the response is sent.
 * Hooks res "finish" so enqueueing runs post-response and never delays the request.
 * Controllers may set `res.locals.cid` when the catalog id is not in params/body
 * (e.g. cart remove by cartItemId).
 * @middleware
 * @param {number} eventTypeId - value from EVENT_DEFINITIONS
 */
function track(eventTypeId) {
    return (req, res, next) => {
        res.on("finish", () => {
            if (res.statusCode < 200 || res.statusCode >= 300) return;

            if (!isEventActive(eventTypeId)) return;

            const payload = {
                event_type_id: eventTypeId,
                user_id: req.user?.user_id ?? null,
                cid: resolveCid(req, res),
                ip_address: req.ip ?? null,
                meta: { path: req.originalUrl, method: req.method },
            };

            getProducer(QUEUES.ANALYTICS.PRODUCER_NAME)
                .produce(payload)
                .catch((err) =>
                    log.error("Analytics", "track", "enqueue failed", err),
                );
        });

        next();
    };
}

export { track };
