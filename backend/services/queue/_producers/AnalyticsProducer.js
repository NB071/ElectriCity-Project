// Queue Service
// Strategy pattern / analytics producer strategy (concrete strategy)

import ProducerStrategy from "./ProducerStrategy.js";
import getQueue from "../_queues/index.js";
import { QUEUES } from "../constants.js";

/**
 * This makes sure that analytics capture jobs are enqueued to the analytics queue.
 * @extends ProducerStrategy (Strategy pattern)
 */
class AnalyticsProducer extends ProducerStrategy {
    /** @type {import('bullmq').Queue} */
    #queueContext = null;

    /**
     * Creates a new analytics producer.
     */
    constructor() {
        super();
        this.#queueContext = getQueue(QUEUES.ANALYTICS.QUEUE_NAME);
    }

    /**
     * Enqueues analytics capture jobs.
     * @param {object} payload
     * @param {number} payload.event_type_id
     * @param {number|null} [payload.user_id]
     * @param {number|null} [payload.cid]
     * @param {string|null} [payload.ip_address]
     * @param {object|null} [payload.meta]
     * @returns {Promise<import('bullmq').Job>}
     */
    async produce(payload) {
        return this.#queueContext.add(QUEUES.ANALYTICS.JOBS.CAPTURE, payload);
    }
}

const analyticsProducer = new AnalyticsProducer();
export default analyticsProducer;
