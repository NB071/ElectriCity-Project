// Order Service
// Shared helpers for checkout strategies

import orderDAO from "../orderDAO.js";
import { validateOrderForPayment } from "../orderQuery.js";
import paymentService from "../../payment/payment.service.js";
import { ADDRESS_TYPES, VALIDATIONS, DEFAULTS } from "../constants.js";

/**
 * This function rounds a number to 2 decimal places (currency precision).
 * @param {number} amount
 * @returns {number}
 */
function roundCurrency(amount) {
    return Math.round(amount * 100) / 100;
}

/**
 * This function computes subtotal/tax/total for a list of priced line items.
 * @param {object[]} items [{ unit_price, quantity }]
 * @returns {{ subtotal: number, tax: number, total: number }}
 */
function computeOrderTotals(items) {
    const subtotal = roundCurrency(
        items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    );
    const tax = roundCurrency(subtotal * DEFAULTS.TAX_RATE);
    const total = roundCurrency(subtotal + tax);

    return { subtotal, tax, total };
}

/**
 * This function builds the shipping + billing order_addresses records to persist.
 * When billingAddress is omitted, the shipping address is duplicated as billing.
 * @param {object} shippingAddress
 * @param {object} [billingAddress]
 * @returns {object[]}
 */
function buildAddressRecords(shippingAddress, billingAddress) {
    const shipping = {
        ...shippingAddress,
        address_type: ADDRESS_TYPES.SHIPPING,
    };
    const billing = {
        ...(billingAddress ?? shippingAddress),
        address_type: ADDRESS_TYPES.BILLING,
    };

    return [shipping, billing];
}

/**
 * This function creates an order from already-priced items/addresses, then charges it via the
 * payment service. Order-side validation (ownership, amount, payability) runs through
 * validateOrderForPayment only when the order belongs to an authenticated user; guest orders skip
 * ownership validation since there is no session to check against (mirrors the existing guest
 * payment flow, which also bypasses validateOrderForPayment). Payment method/details are validated
 * by paymentService/paymentValidator alone.
 * @param {object} input
 * @param {number|null} input.userId
 * @param {string|null} [input.guest_email]
 * @param {object[]} input.resolvedItems [{ cid, config_id, quantity, unit_price }]
 * @param {object} input.shipping_address
 * @param {object} [input.billing_address]
 * @param {string} input.payment_method
 * @param {object} [input.payment_details]
 * @returns {Promise<object>} Checkout result
 * @throws {ValidationError} If the cart/items are invalid or the order cannot be paid
 * @throws {NotFoundError} If a catalog item/configuration/order does not exist
 * @throws {ForbiddenError} If the order does not belong to the authenticated user
 * @throws {ConflictError} If the order is already paid or cancelled
 * @throws {DatabaseError} On database failures
 */
async function runCheckout({
    userId,
    guest_email,
    resolvedItems,
    shipping_address,
    billing_address,
    payment_method,
    payment_details,
}) {
    const { subtotal, tax, total } = computeOrderTotals(resolvedItems);
    const addresses = buildAddressRecords(shipping_address, billing_address);

    const order_id = await orderDAO.createOrderWithItems({
        order: {
            user_id: userId,
            guest_email: userId == null ? guest_email : null,
            subtotal,
            tax,
            total,
        },
        items: resolvedItems,
        addresses,
    });

    if (userId != null) {
        await validateOrderForPayment({
            order_id,
            user_id: userId,
            amount: total,
        });
    }

    const paymentResult = await paymentService.processPayment({
        user_id: userId,
        order_id,
        amount: total,
        payment_method,
        payment_details,
    });

    const paid = paymentResult.payment_status === VALIDATIONS.PAYMENT_STATUS.PAID;

    if (paid) {
        await orderDAO.updateOrderStatus(
            order_id,
            VALIDATIONS.ORDER_STATUS.CONFIRMED,
        );
    }

    return {
        order_id,
        order_status: paid
            ? VALIDATIONS.ORDER_STATUS.CONFIRMED
            : VALIDATIONS.ORDER_STATUS.PENDING,
        payment_status: paymentResult.payment_status,
        subtotal,
        tax,
        total,
        payment: {
            attempt_id: paymentResult.attempt_id,
            status: paymentResult.status,
            payment_method: paymentResult.payment_method,
        },
    };
}

export { roundCurrency, computeOrderTotals, buildAddressRecords, runCheckout };
