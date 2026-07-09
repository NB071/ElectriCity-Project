// Payment Service
// Strategy pattern / Apple Pay strategy (concrete strategy)

import PaymentStrategy from "./PaymentStrategy.js";
import { resolveMockAttemptStatus } from "./mockGateway.js";

/**
 * Processes Apple Pay payments via the configured gateway.
 * @extends PaymentStrategy (Strategy pattern)
 */
class ApplePayStrategy extends PaymentStrategy {
    /**
     * @param {object} input
     * @param {number|null} [input.user_id]
     * @param {number} input.order_id
     * @param {string} input.payment_method
     * @param {object} input.payment_details Expected: { token }
     * @returns {Promise<{ status: string }>}
     */
    async process(input) {
        const status = await resolveMockAttemptStatus(input);
        return { status };
    }
}

const applePayStrategy = new ApplePayStrategy();
export default applePayStrategy;
