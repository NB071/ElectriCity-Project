// Order Service
// CQRS - Mutation side (writes)

import orderDAO from "./orderDAO.js";
import {
    validateOrderId,
    validateOrderPaymentStatus,
} from "./orderValidator.js";

/**
 * This function updates an order's payment_status.
 * @param {number|string} order_id
 * @param {string} payment_status Value from VALIDATIONS.PAYMENT_STATUS
 * @returns {Promise<void>}
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the order is not found
 * @throws {DatabaseError} On database failures
 */
async function updatePaymentStatus(order_id, payment_status) {
    const validOrderId = validateOrderId(order_id);
    const validStatus = validateOrderPaymentStatus(payment_status);

    await orderDAO.updatePaymentStatus(validOrderId, validStatus);
}

export { updatePaymentStatus };
