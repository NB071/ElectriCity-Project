// Payment Service
// Strategy pattern / credit card strategy (concrete strategy)

import PaymentStrategy from "./PaymentStrategy.js";

/**
 * Processes credit card payments via the configured gateway.
 * @extends PaymentStrategy (Strategy pattern)
 */
class CreditCardStrategy extends PaymentStrategy {
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

        const requests = await paymentDAO.countPaymentMethodAttempts(user_id, VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD);

        if (requests % 3 === 0) {
            return {
                status: VALIDATIONS.ATTEMPT_STATUS.FAILED,
                gateway_payload: {
                    reason: "simulated_gateway_denial",
                    credit_card_details: payment_details,
                    amount,
                    order_id,
                    user_id,
                },
            };
        }

        return {
            status: VALIDATIONS.ATTEMPT_STATUS.SUCCESS,
            gateway_payload: {
                credit_card_details: payment_details,
                amount,
                order_id,
                user_id,
            },
        };
    }
}

const creditCardStrategy = new CreditCardStrategy();
export default creditCardStrategy;
