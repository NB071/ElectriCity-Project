// Queue Service
// Strategy pattern / queue strategy abstract class

/**
 * This is the abstract class for queue strategies.
 * @abstract
 */
class QueueStrategy {
    /**
     * This method must be implemented by each queue strategy.
     * @param {string} _jobName
     * @param {object} _payload
     * @param {object} _options
     */
    add(_jobName, _payload, _options) {
        throw new Error("add() must be implemented by subclass");
    }
}

export default QueueStrategy;
