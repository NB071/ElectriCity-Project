// Analytics Service
// Express middleware for event capture

import { getProducer } from "../services/queue/queue.service.js";
import { QUEUES } from "../services/queue/constants.js";
import { isEventActive } from "../services/analytics/analyticsCache.js";

/**
 * Returns middleware that enqueues the given event after the response is sent.
 * Hooks res "finish" so enqueueing runs post-response and never delays the request.
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
                cid: req.params?.cid ? Number(req.params.cid) : null,
                ip_address: req.ip ?? null,
                meta: { path: req.originalUrl, method: req.method },
            };

            getProducer(QUEUES.ANALYTICS.PRODUCER_NAME)
                .produce(payload)
                .catch((err) =>
                    console.error(
                        "[Middleware: Analytics] enqueue failed:",
                        err.message,
                    ),
                );
        });

        next();
    };
}

export { track };
