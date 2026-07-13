// Order Service
// CQRS - Mutation side (writes)

import orderDAO from "./orderDAO.js";
import {
    validateOrderId,
    validateOrderPaymentStatus,
    validateOrderStatus,
    validateCustomerCheckoutInput,
    validateGuestCheckoutInput,
} from "./orderValidator.js";
import getCheckoutStrategy from "./strategies/index.js";
import { CHECKOUT_ACTORS, VALIDATIONS } from "./constants.js";
import { ValidationError, ConflictError } from "../../utils/errors.js";

/**
 * This function updates an order's payment_status.
 * @param {number|string} order_id Order ID
 * @param {string} payment_status Value from VALIDATIONS.PAYMENT_STATUS
 * @returns {Promise<void>}
 * @throws {ValidationError} If validation fails
 * @throws {ConflictError} If the transition is not allowed
 * @throws {NotFoundError} If the order is not found
 * @throws {DatabaseError} On database failures
 */
async function updatePaymentStatus(order_id, payment_status) {
    // validate the order id and payment status
    const validOrderId = validateOrderId(order_id);
    const validStatus = validateOrderPaymentStatus(payment_status);

    // find the order by the order id
    const order = await orderDAO.findById(validOrderId);

    // if the order payment status is the same as the requested payment status, return
    if (order.payment_status === validStatus) {
        return;
    }

    // get the allowed payment status transitions
    const allowed =
        VALIDATIONS.PAYMENT_STATUS_TRANSITIONS[order.payment_status] ?? [];

    // if the allowed payment status transitions does not include the requested payment status, throw a conflict error
    if (!allowed.includes(validStatus)) {
        throw new ConflictError(
            `Cannot change payment_status from "${order.payment_status}" to "${validStatus}".`,
            {
                current_status: order.payment_status,
                requested_status: validStatus,
                allowed_transitions: allowed,
            },
        );
    }

    await orderDAO.updatePaymentStatus(validOrderId, validStatus);
}

/**
 * This function updates an order's order_status.
 * @requiredRole admin
 * @param {number|string} order_id Order ID
 * @param {string} order_status order status from VALIDATIONS.ORDER_STATUS
 * @returns {Promise<void>}
 * @throws {ValidationError} If validation fails
 * @throws {ConflictError} If the transition is not allowed or payment blocks shipping
 * @throws {NotFoundError} If the order is not found
 * @throws {DatabaseError} On database failures
 */
async function updateOrderStatus(order_id, order_status) {
    // validate the order id and order status
    const validOrderId = validateOrderId(order_id);
    const validStatus = validateOrderStatus(order_status);
    const order = await orderDAO.findById(validOrderId);

    const current = order.order_status;
    const allowed = VALIDATIONS.ORDER_STATUS_TRANSITIONS[current] ?? [];

    // if the allowed transitions does not include the requested status, throw a conflict error
    if (!allowed.includes(validStatus)) {
        throw new ConflictError(
            `Cannot change order_status from "${current}" to "${validStatus}".`,
            {
                current_status: current,
                requested_status: validStatus,
                allowed_transitions: allowed,
            },
        );
    }

    // if the requested status is shipped or delivered and the payment status is not paid, throw a conflict error
    if (
        (validStatus === VALIDATIONS.ORDER_STATUS.SHIPPED ||
            validStatus === VALIDATIONS.ORDER_STATUS.DELIVERED) &&
        order.payment_status !== VALIDATIONS.PAYMENT_STATUS.PAID
    ) {
        throw new ConflictError(
            "Order must be paid before it can be shipped or delivered.",
            {
                payment_status: order.payment_status,
                requested_status: validStatus,
            },
        );
    }

    if (validStatus === VALIDATIONS.ORDER_STATUS.CANCELLED) {
        // failed = checkout already released stock; paid/unpaid still hold inventory
        const restoreStock =
            order.payment_status !== VALIDATIONS.PAYMENT_STATUS.FAILED;
        await orderDAO.cancelOrderWithStockRestore(validOrderId, restoreStock);
        return;
    }

    await orderDAO.updateOrderStatus(validOrderId, validStatus);
}

/**
 * This function resolves the checkout actor from the authenticated user id when the actor is omitted.
 * @param {object} data Checkout input
 * @param {string} [data.actor] Actor (customer or guest)
 * @param {number|null} [data.userId] User ID
 * @returns {string} Checkout actor
 */
function resolveCheckoutActor({ actor, userId }) {
    if (actor != null) {
        return actor;
    }
    // if the user id is not null, return the customer actor, otherwise return the guest actor
    return userId != null ? CHECKOUT_ACTORS.CUSTOMER : CHECKOUT_ACTORS.GUEST;
}

/**
 * This function checks out via the customer or guest strategy.
 * @param {object} data Checkout input
 * @param {string} [data.actor] Actor (customer or guest)
 * @param {number|null} [data.userId] User ID
 * @param {string|null} [data.sessionToken] Session token
 * @param {string} [data.guest_email] Guest email
 * @param {object[]} [data.items] Legacy guest items when no cart session
 * @param {object} data.shipping_address Shipping address
 * @param {object} [data.billing_address] Billing address
 * @param {string} data.payment_method Payment method
 * @param {object} [data.payment_details] Payment details
 * @returns {Promise<object>} Checkout result
 * @throws {ValidationError} If validation fails, the actor is unknown, or the cart is empty
 * @throws {NotFoundError} If a catalog item/configuration/order does not exist
 * @throws {ForbiddenError} If the order does not belong to the authenticated user
 * @throws {ConflictError} If the order is already paid or cancelled
 * @throws {DatabaseError} On database failures
 */
async function checkout(input) {
    // resolve the checkout actor
    const actor = resolveCheckoutActor(input);

    // if the actor is the customer, validate the customer checkout input
    if (actor === CHECKOUT_ACTORS.CUSTOMER) {
        const valid = validateCustomerCheckoutInput(input);
        return getCheckoutStrategy(CHECKOUT_ACTORS.CUSTOMER).checkout(valid);
    }

    // if the actor is the guest, validate the guest checkout input
    if (actor === CHECKOUT_ACTORS.GUEST) {
        const valid = validateGuestCheckoutInput(input);
        return getCheckoutStrategy(CHECKOUT_ACTORS.GUEST).checkout(valid);
    }

    // if the actor is unknown, throw a validation error
    throw new ValidationError(`Unknown checkout actor: ${actor}`);
}

export { updatePaymentStatus, updateOrderStatus, checkout };
