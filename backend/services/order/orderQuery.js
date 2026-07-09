// Order Service
// CQRS - Query side (reads)

import orderDAO from "./orderDAO.js";
import { validateOrderId } from "./orderValidator.js";
import {
    NotFoundError,
    ForbiddenError,
    ConflictError,
    ValidationError,
} from "../../utils/errors.js";
import { VALIDATIONS } from "./constants.js";

/**
 * This function ensures an order exists.
 * @param {number|string} orderId
 * @returns {Promise<number>} Validated order id
 * @throws {ValidationError} If the order id is invalid
 * @throws {NotFoundError} If the order does not exist
 * @throws {DatabaseError} On database failures
 */
async function ensureOrderExists(orderId) {
    const id = validateOrderId(orderId);
    const exists = await orderDAO.existsById(id);

    if (!exists) {
        throw new NotFoundError("Order");
    }

    return id;
}

/**
 * This function validates that an order can be paid by the given user for the given amount.
 * @param {object} input
 * @param {number} input.order_id
 * @param {number} input.user_id
 * @param {number} input.amount
 * @returns {Promise<object>} The order row
 * @throws {ValidationError} If ids or amount are invalid
 * @throws {NotFoundError} If the order does not exist
 * @throws {ForbiddenError} If the order does not belong to the user
 * @throws {ConflictError} If the order is already paid or cancelled
 * @throws {DatabaseError} On database failures
 */
async function validateOrderForPayment({ order_id, user_id, amount }) {
    const id = validateOrderId(order_id);
    const order = await orderDAO.findById(id);

    if (order.user_id == null || order.user_id !== user_id) {
        throw new ForbiddenError("You do not have access to this order.");
    }

    if (order.payment_status === VALIDATIONS.PAYMENT_STATUS.PAID) {
        throw new ConflictError("Order is already paid.");
    }

    if (order.order_status === VALIDATIONS.ORDER_STATUS.CANCELLED) {
        throw new ConflictError("Order is cancelled.");
    }

    if (Number(amount) !== Number(order.total)) {
        throw new ValidationError("Payment amount does not match order total.");
    }

    return order;
}

export { ensureOrderExists, validateOrderForPayment };
