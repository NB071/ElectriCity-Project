// Queue Service
// Strategy pattern / analytics queue strategy (concrete strategy)

import { Queue } from "bullmq";
import { redisConfig } from "../../../configs/redis.js";
import { QUEUES } from "../constants.js";
import QueueStrategy from "./QueueStrategy.js";

/**
 * This is the concrete strategy for the analytics queue.
 * @extends QueueStrategy (Strategy pattern)
 */
class AnalyticsQueueStrategy extends QueueStrategy {
    /** @type {import('bullmq').Queue} */
    #queueContext = null;

    /**
     * Creates a new analytics queue strategy.
     */
    constructor() {
        super();
        this.#queueContext = this.#getQueue(QUEUES.ANALYTICS.QUEUE_NAME);
    }

    /**
     * This private method creates a new or returns an existing analytics queue.
     * @private
     * @param {string} queueName
     * @returns {import('bullmq').Queue}
     */
    #getQueue(queueName) {
        if (this.#queueContext) {
            return this.#queueContext;
        }

        this.#queueContext = new Queue(queueName, {
            connection: { ...redisConfig },
            defaultJobOptions: QUEUES.ANALYTICS.OPTIONS,
        });

        return this.#queueContext;
    }

    /**
     * Adds a job to the analytics queue.
     * @param {string} jobName
     * @param {object} payload
     * @param {object} options
     * @returns {Promise<import('bullmq').Job>}
     */
    add(jobName, payload, options) {
        return this.#queueContext.add(jobName, payload, options);
    }
}

const analyticsQueue = new AnalyticsQueueStrategy();

export default analyticsQueue;
