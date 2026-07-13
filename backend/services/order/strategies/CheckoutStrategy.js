// Order Service
// Strategy pattern / checkout strategy abstract class

/**
 * This is the abstract class for order checkout strategies.
 * @abstract
 */
class CheckoutStrategy {
    /**
     * This method must be implemented by each checkout strategy.
     * @param {object} _input
     * @returns {Promise<object>}
     */
    checkout(_input) {
        throw new Error("checkout() must be implemented by subclass");
    }
}

export default CheckoutStrategy;
