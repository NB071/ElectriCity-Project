// Order Service
// CQRS - Mutation side (writes)

import orderDAO from "./orderDAO.js";
import {
    validateOrderId,
    validateOrderPaymentStatus,
    validateOrderStatus,
    validateCustomerCheckoutInput,
    validateAdminCheckoutInput,
} from "./orderValidator.js";
import getCheckoutStrategy from "./strategies/index.js";
import { CHECKOUT_ACTORS } from "./constants.js";
import { ValidationError } from "../../utils/errors.js";

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

/**
 * This function updates an order's order_status.
 * @requiredRole admin
 * @param {number|string} order_id
 * @param {string} order_status Value from VALIDATIONS.ORDER_STATUS
 * @returns {Promise<void>}
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the order is not found
 * @throws {DatabaseError} On database failures
 */
async function updateOrderStatus(order_id, order_status) {
    const validOrderId = validateOrderId(order_id);
    const validStatus = validateOrderStatus(order_status);

    await orderDAO.updateOrderStatus(validOrderId, validStatus);
}

/**
 * This function checks out an order for either a customer/guest or an admin, via the strategy
 * registered for the given actor. See services/order/strategies/ for the checkout algorithms.
 * @param {object} data
 * @param {string} data.actor "customer" or "admin", from CHECKOUT_ACTORS
 * @param {number|null} [data.userId] Authenticated/target user id; null for guest checkout
 * @param {string} [data.guestEmail] Required for guest checkout (either actor)
 * @param {object[]} [data.items] Line items; required for guests and for admin checkout
 * @param {object} data.shippingAddress
 * @param {object} [data.billingAddress]
 * @param {string} data.paymentMethod
 * @param {object} [data.paymentDetails]
 * @returns {Promise<object>} Checkout result (order_id, order_status, payment_status, totals, payment)
 * @throws {ValidationError} If validation fails, the actor is unknown, or the cart is empty
 * @throws {NotFoundError} If a catalog item/configuration/order does not exist
 * @throws {ForbiddenError} If the order does not belong to the authenticated user
 * @throws {ConflictError} If the order is already paid or cancelled
 * @throws {DatabaseError} On database failures
 */
async function checkout({ actor, ...input }) {
    if (actor === CHECKOUT_ACTORS.ADMIN) {
        const valid = validateAdminCheckoutInput(input);
        return getCheckoutStrategy(CHECKOUT_ACTORS.ADMIN).checkout(valid);
    }

    if (actor === CHECKOUT_ACTORS.CUSTOMER) {
        const valid = validateCustomerCheckoutInput(input);
        return getCheckoutStrategy(CHECKOUT_ACTORS.CUSTOMER).checkout(valid);
    }

    throw new ValidationError(`Unknown checkout actor: ${actor}`);
}

export { updatePaymentStatus, updateOrderStatus, checkout };
