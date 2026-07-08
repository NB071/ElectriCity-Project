// Payment Service
// Strategy pattern / debit card strategy (concrete strategy)

import PaymentStrategy from "./PaymentStrategy.js";
let requestsCount = 0;
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
        const { user_id, order_id, amount, payment_details = {} } = input;

        requestsCount += 1;

        if (requestsCount % 3 === 0) {
            return {
                status: VALIDATIONS.ATTEMPT_STATUS.FAILED,
                gateway_payload: {
                    reason: "simulated_gateway_denial",
                    debit_card_details: payment_details,
                    amount,
                    order_id,
                    user_id,
                },
            };
        }

        return {
            status: VALIDATIONS.ATTEMPT_STATUS.SUCCESS,
            gateway_payload: {
                debit_card_details: payment_details,
                amount,
                order_id,
                user_id,
            },
        };
    }
}

const debitCardStrategy = new DebitCardStrategy();
export default debitCardStrategy;
