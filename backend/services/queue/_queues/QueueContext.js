// Queue Service
// Strategy pattern / queue context

/**
 * This is the context that wraps the queue strategy.
 * @extends QueueStrategy (Strategy pattern)
 */
class QueueContext {
    /** @type {QueueStrategy} */
    #strategy = null;

    /**
     * Sets the queue strategy.
     * @param {QueueStrategy} strategy
     */
    setStrategy(strategy) {
        this.#strategy = strategy;
    }

    /**
     * Adds a job to the queue.
     * @param {string} jobName
     * @param {object} payload
     * @param {object} options
     * @returns {Promise<import('bullmq').Job>}
     */
    add(jobName, payload, options) {
        if (!this.#strategy) {
            throw new Error("No queue strategy set.");
        }

        return this.#strategy.add(jobName, payload, options);
    }
}

export default QueueContext;
