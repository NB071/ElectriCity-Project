// Analytics Job Processor | Queue Service
// Persists captured events via the analytics service facade

import { capture } from "../../../analytics/analytics.service.js";

/**
 * This function processes an analytics capture job.
 * @param {object} payload
 * @param {number} payload.event_type_id
 * @param {number|null} [payload.user_id]
 * @param {number|null} [payload.cid]
 * @param {string|null} [payload.ip_address]
 * @param {object|null} [payload.meta]
 * @returns {Promise<number|null>} inserted event_id, or null if event type is inactive
 */
async function processAnalyticsJob(payload) {
    return capture(payload);
}

export default processAnalyticsJob;
