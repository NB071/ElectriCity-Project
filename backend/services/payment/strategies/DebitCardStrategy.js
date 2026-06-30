// Payment Service
// Strategy pattern / debit card strategy (concrete strategy)

import PaymentStrategy from "./PaymentStrategy.js";

/**
 * Processes debit card payments via the configured gateway.
 * @extends PaymentStrategy (Strategy pattern)
 */
class DebitCardStrategy extends PaymentStrategy {
    /**
     * @param {object} input
     * @param {number} input.user_id
     * @param {number} input.order_id
     * @param {number} input.amount
     * @param {object} input.payment_details Expected: { token } or card fields per gateway
     * @returns {Promise<{ status: string, gateway_reference: string|null }>}
     */
    async process(_input) {
        // TODO: Implement debit card gateway integration
        throw new Error("Not implemented");
    }
}

const debitCardStrategy = new DebitCardStrategy();
export default debitCardStrategy;
