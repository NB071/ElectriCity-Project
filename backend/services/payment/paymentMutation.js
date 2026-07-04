// Payment Service
// CQRS - Mutation side (writes)

import getStrategy from "./strategies/index.js";
import toPaymentResultDTO from "./DTOs/paymentResultDTO.js";

/**
 * This function processes a payment for an order.
 * user_id must come from req.user.user_id, not the request body.
 * Delegates gateway logic to the payment method strategy.
 * Records a payment_attempt and updates orders.payment_status on success.
 * @requiredRole customer
 * @param {object} input
 * @param {number} input.user_id
 * @param {number} input.order_id
 * @param {number} input.amount
 * @param {string} input.payment_method
 * @param {object} [input.payment_details] Gateway-specific payload (card token, etc.)
 * @returns {Promise<object>} Payment result with attempt_id and status
 * @throws {Error} If validation fails or payment processing fails
 */
async function processPayment({user_id, order_id, amount, payment_method, payment_details}) {
 
    const gatewayResult = await getStrategy(payment_method).process({
        user_id,
        order_id,
        amount,
        payment_details,
    });

    await recordPaymentAttempt({
        order_id,
        user_id,
        amount,
        payment_method,
        status: gatewayResult.status,
    });

    if (gatewayResult.status === VALIDATIONS.ATTEMPT_STATUS.SUCCESS) {
        await updateOrderPaymentStatus(order_id, VALIDATIONS.ORDER_PAYMENT_STATUS.PAID);
    }

    return //gatewayResultDTO.toPaymentResultDTO({;
}

/**
 * This function records a payment attempt without running the gateway.
 * @requiredRole customer
 * @param {object} input
 * @param {number} input.order_id
 * @param {number} input.user_id
 * @param {number} input.amount
 * @param {string} input.payment_method
 * @param {string} input.status
 * @returns {Promise<{ attempt_id: number }>}
 * @throws {Error} If validation fails or the insert fails
 */
async function recordPaymentAttempt({
    order_id,
    user_id,
    amount,
    payment_method,
    status,
}) {
    return paymentDAO.insertPaymentAttempt({
        order_id,
        user_id,
        amount,
        payment_method,
        status,
    });
    
}

/**
 * This function updates an order's payment_status.
 * @requiredRole admin
 * @param {number|string} order_id
 * @param {string} payment_status Value from VALIDATIONS.ORDER_PAYMENT_STATUS
 * @returns {Promise<void>}
 * @throws {Error} If validation fails or the update fails
 */
async function updateOrderPaymentStatus(order_id, payment_status) {
    // TODO: Implement
    throw new Error("Not implemented");
}

export { processPayment, recordPaymentAttempt, updateOrderPaymentStatus };
