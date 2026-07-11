// Queue Service
// Strategy pattern / producer context

import { InternalError } from "../../../utils/errors.js";

/**
 * This is the context that wraps the producer strategy.
 * @extends ProducerStrategy (Strategy pattern)
 */
class ProducerContext {
    /** @type {ProducerStrategy} */
    #strategy = null;

    /**
     * Sets the producer strategy.
     * @param {ProducerStrategy} strategy
     */
    setStrategy(strategy) {
        this.#strategy = strategy;
    }

    /**
     * Produces a job.
     * @param {object} payload
     * @returns {Promise<import('bullmq').Job>}
     */
    async produce(payload) {
        if (!this.#strategy) {
            throw new InternalError("No producer strategy set.");
        }

        return this.#strategy.produce(payload);
    }
}

export default ProducerContext;
