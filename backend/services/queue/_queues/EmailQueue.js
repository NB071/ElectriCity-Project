// Queue Service
// Strategy pattern / email queue strategy (concrete strategy)

/* Resources used:
 * https://docs.bullmq.io/guide/connections
 */

import { Queue } from "bullmq";
import { redisConfig } from "../../../configs/redis.js";
import { QUEUES } from "../constants.js";
import QueueStrategy from "./QueueStrategy.js";

/**
 * This is the concrete strategy for the email queue.
 * @extends QueueStrategy (Strategy pattern)
 */
class EmailQueueStrategy extends QueueStrategy {
    /** @type {import('bullmq').Queue} */
    #queueContext = null;

    /**
     * Creates a new email queue strategy.
     */
    constructor() {
        super();
        this.#queueContext = this.#getQueue(QUEUES.EMAIL.QUEUE_NAME);
    }

    /**
     * This private method creates a new or returns an existing email queue.
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
            defaultJobOptions: QUEUES.EMAIL.OPTIONS,
        });

        return this.#queueContext;
    }

    /**
     * Adds a job to the email queue.
     * @param {string} jobName
     * @param {object} payload
     * @param {object} options
     * @returns {Promise<import('bullmq').Job>}
     */
    add(jobName, payload, options) {
        return this.#queueContext.add(jobName, payload, options);
    }
}

const emailQueue = new EmailQueueStrategy();

export default emailQueue;
