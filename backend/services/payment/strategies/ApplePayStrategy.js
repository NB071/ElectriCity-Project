// Payment Service
// Strategy pattern / Apple Pay strategy (concrete strategy)

import PaymentStrategy from "./PaymentStrategy.js";
import { VALIDATIONS } from "../constants.js";

let requestsCount = 0;

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
     * @returns {Promise<{ status: string, gateway_payload: object|null }>}
     */
    async process(input) {
        const { user_id, order_id, amount, payment_details = {} } = input;
        
        requestsCount += 1;

        if (requestsCount % 3 === 0) {
            return {
                status: VALIDATIONS.ATTEMPT_STATUS.FAILED,
                gateway_payload: {
                    reason: "simulated_gateway_denial",
                    apple_pay_token: token,
                    amount,
                    order_id,
                    user_id,
                },
            };
        }

        return {
            status: VALIDATIONS.ATTEMPT_STATUS.SUCCESS,
            gateway_payload: {
                apple_pay_token: token,
                amount,
                order_id,
                user_id,
            },
        };
    }
}

const applePayStrategy = new ApplePayStrategy();
export default applePayStrategy;
