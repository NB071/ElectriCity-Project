// Payment Service
// Strategy pattern / Apple Pay strategy (concrete strategy)

import PaymentStrategy from "./PaymentStrategy.js";

/**
 * Processes Apple Pay payments via the configured gateway.
 * @extends PaymentStrategy (Strategy pattern)
 */
class ApplePayStrategy extends PaymentStrategy {
    /**
     * @param {object} input
     * @param {number} input.user_id
     * @param {number} input.order_id
     * @param {number} input.amount
     * @param {object} input.payment_details Expected: { apple_pay_token }
     * @returns {Promise<{ status: string, gateway_reference: string|null }>}
     */
    async process(_input) {
        // TODO: Implement Apple Pay gateway integration
        throw new Error("Not implemented");
    }
}

const applePayStrategy = new ApplePayStrategy();
export default applePayStrategy;
