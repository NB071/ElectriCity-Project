// Queue Service
// Strategy pattern / producer strategy abstract class

/**
 * This is the abstract class for producer strategies.
 * @abstract
 */
class ProducerStrategy {
    /**
     * This method must be implemented by each producer strategy.
     * @param {object} _payload
     */
    async produce(_payload) {
        throw new Error("produce() must be implemented by subclass");
    }
}

export default ProducerStrategy;
