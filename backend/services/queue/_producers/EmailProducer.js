// Queue Service
// Strategy pattern / email producer strategy (concrete strategy)
import ProducerStrategy from "./ProducerStrategy.js";
import getQueue from "../_queues/index.js";
import { QUEUES } from "../constants.js";

/**
 * This makes sure that email jobs are enqueued to the mailing queue.
 * @extends ProducerStrategy (Strategy pattern)
 */
class EmailProducer extends ProducerStrategy {
    /** @type {import('bullmq').Queue} */
    #queueContext = null;

    /**
     * Creates a new email producer.
     */
    constructor() {
        super();
        this.#queueContext = getQueue(QUEUES.EMAIL.QUEUE_NAME);
    }

    /**
     * Enqueues email jobs to the mailing queue.
     * @param {object} payload
     * @param {string} payload.to
     * @param {string} payload.template
     * @param {object} payload.vars
     * @returns {Promise<import('bullmq').Job>}
     */
    async produce(payload) {
        return this.#queueContext.add(QUEUES.EMAIL.JOBS.SEND, payload);
    }
}

const emailProducer = new EmailProducer();
export default emailProducer;
