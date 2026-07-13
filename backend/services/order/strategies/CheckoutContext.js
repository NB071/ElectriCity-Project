// Order Service
// Strategy pattern / checkout context

/**
 * This is the context that wraps the checkout strategy.
 */
class CheckoutContext {
    /** @type {CheckoutStrategy} */
    #strategy = null;

    /**
     * Sets the checkout strategy.
     * @param {CheckoutStrategy} strategy
     */
    setStrategy(strategy) {
        this.#strategy = strategy;
    }

    /**
     * Runs checkout using the selected strategy.
     * @param {object} input
     * @returns {Promise<object>}
     */
    async checkout(input) {
        if (!this.#strategy) {
            throw new Error("No checkout strategy set.");
        }

        return this.#strategy.checkout(input);
    }
}

export default CheckoutContext;
