// Payment Service
// Strategy pattern / payment strategy abstract class

import { InternalError } from "../../../utils/errors.js";

/**
 * This is the abstract class for payment processing strategies.
 * @abstract
 */
class PaymentStrategy {
    /**
     * This method must be implemented by each payment strategy.
     * @param {object} _input
     * @param {number} _input.user_id
     * @param {number} _input.order_id
     * @param {number} _input.amount
     * @param {object} _input.payment_details Gateway-specific payload
     * @returns {Promise<object>}
     */
    process(_input) {
        throw new InternalError(
            "Payment strategy process() is not implemented",
        );
    }
}

export default PaymentStrategy;
