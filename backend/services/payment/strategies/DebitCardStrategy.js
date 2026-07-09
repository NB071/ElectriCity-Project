// Payment Service
// Strategy pattern / debit card strategy (concrete strategy)

import PaymentStrategy from "./PaymentStrategy.js";
import { resolveMockAttemptStatus } from "./mockGateway.js";

/**
 * Processes debit card payments via the configured gateway.
 * @extends PaymentStrategy (Strategy pattern)
 */
class DebitCardStrategy extends PaymentStrategy {
    /**
     * @param {object} input
     * @param {number|null} [input.user_id]
     * @param {number} input.order_id
     * @param {string} input.payment_method
     * @returns {Promise<{ status: string }>}
     */
    async process(input) {
        const status = await resolveMockAttemptStatus(input);
        return { status };
    }
}

const debitCardStrategy = new DebitCardStrategy();
export default debitCardStrategy;
