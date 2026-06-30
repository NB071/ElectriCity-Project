// Payment Service
// Strategy pattern / payment context

/**
 * This is the context that wraps the payment processing strategy.
 * @extends PaymentStrategy (Strategy pattern)
 */
class PaymentContext {
    /** @type {PaymentStrategy} */
    #strategy = null;

    /**
     * Sets the payment processing strategy.
     * @param {PaymentStrategy} strategy
     */
    setStrategy(strategy) {
        this.#strategy = strategy;
    }

    /**
     * Processes a payment using the selected strategy.
     * @param {object} input
     * @param {number} input.user_id
     * @param {number} input.order_id
     * @param {number} input.amount
     * @param {object} input.payment_details Gateway-specific payload
     * @returns {Promise<object>}
     */
    process(input) {
        if (!this.#strategy) {
            throw new Error("No payment strategy set.");
        }

        return this.#strategy.process(input);
    }
}

export default PaymentContext;
