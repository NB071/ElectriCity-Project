// Payment Service
// CQRS - Mutation side (writes)

import getStrategy from "./strategies/index.js";
import { toPaymentResultDTO } from "./DTOs/paymentResultDTO.js";
import { toRecordPaymentAttemptDTO } from "./DTOs/paymentSharedDTO.js";
import {
    validateProcessPaymentInput,
    validatePaymentAttemptInput,
} from "./paymentValidator.js";
import paymentDAO from "./paymentDAO.js";
import orderService from "../order/order.service.js";
import { VALIDATIONS } from "./constants.js";

/**
 * This function processes a payment for an order.
 * Order validation (ownership, amount, payability) is the caller's responsibility.
 * @param {object} input
 * @param {number|null} [input.user_id] Authenticated user id; null/omitted for guests
 * @param {number} input.order_id
 * @param {number} input.amount
 * @param {string} input.payment_method
 * @param {object} [input.payment_details] Gateway specific payload (card token, etc.)
 * @returns {Promise<object>} Payment result with attempt_id and status
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the order does not exist when updating payment_status
 * @throws {DatabaseError} On database failures
 */
async function processPayment({
    user_id = null,
    order_id,
    amount,
    payment_method,
    payment_details,
}) {
    const validated = validateProcessPaymentInput({
        user_id,
        order_id,
        amount,
        payment_method,
        payment_details,
    });

    const strategy = getStrategy(validated.payment_method);
    const strategyResult = await strategy.process({
        user_id: validated.user_id,
        order_id: validated.order_id,
        amount: validated.amount,
        payment_method: validated.payment_method,
        payment_details: validated.payment_details,
    });

    const recordPayment = await recordPaymentAttempt({
        order_id: validated.order_id,
        user_id: validated.user_id,
        amount: validated.amount,
        payment_method: validated.payment_method,
        status: strategyResult.status,
    });

    const paymentStatus =
        strategyResult.status === VALIDATIONS.ATTEMPT_STATUS.SUCCESS
            ? orderService.VALIDATIONS.PAYMENT_STATUS.PAID
            : orderService.VALIDATIONS.PAYMENT_STATUS.FAILED;

    await orderService.updatePaymentStatus(validated.order_id, paymentStatus);

    return toPaymentResultDTO({
        attempt_id: recordPayment.attempt_id,
        order_id: validated.order_id,
        amount: validated.amount,
        payment_method: validated.payment_method,
        status: strategyResult.status,
        payment_status: paymentStatus,
    });
}

/**
 * This function records a payment attempt without running the gateway.
 * @param {object} input
 * @param {number} input.order_id
 * @param {number|null} [input.user_id]
 * @param {number} input.amount
 * @param {string} input.payment_method
 * @param {string} input.status
 * @returns {Promise<{ attempt_id: number }>}
 * @throws {ValidationError} If validation fails
 * @throws {DatabaseError} On database failures
 */
async function recordPaymentAttempt({
    order_id,
    user_id = null,
    amount,
    payment_method,
    status,
}) {
    const validated = validatePaymentAttemptInput({
        user_id,
        order_id,
        amount,
        payment_method,
        status,
    });

    const row = await paymentDAO.insertPaymentAttempt({
        order_id: validated.order_id,
        user_id: validated.user_id,
        amount: validated.amount,
        payment_method: validated.payment_method,
        status: validated.status,
    });

    return toRecordPaymentAttemptDTO(row);
}

/**
 * This function updates an order's payment_status.
 * @requiredRole admin
 * @param {number|string} order_id
 * @param {string} payment_status Value from order VALIDATIONS.PAYMENT_STATUS
 * @returns {Promise<void>}
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the order is not found
 * @throws {DatabaseError} On database failures
 */
async function updateOrderPaymentStatus(order_id, payment_status) {
    await orderService.updatePaymentStatus(order_id, payment_status);
}

export { processPayment, recordPaymentAttempt, updateOrderPaymentStatus };
