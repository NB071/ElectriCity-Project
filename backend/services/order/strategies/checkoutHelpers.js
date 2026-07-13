// Order Service
// Shared helpers for checkout strategies

import orderDAO from "../orderDAO.js";
import { validateOrderForPayment } from "../orderQuery.js";
import paymentService from "../../payment/payment.service.js";
import { ADDRESS_TYPES, VALIDATIONS } from "../constants.js";
import { resolveTaxRate } from "../helpers/resolveTaxRate.js";
import { roundCurrency, computeOrderTotals } from "../helpers/orderTotals.js";
import { ConflictError, ValidationError } from "../../../utils/errors.js";
import log from "../../../utils/logger.js";

/**
 * This function builds the shipping + billing order_addresses records to persist.
 * When billingAddress is omitted, the shipping address is duplicated as billing.
 * @param {object} shippingAddress Shipping address
 * @param {object} [billingAddress] Billing address
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
 * This function restores catalog stock and cart lines after a failed or aborted checkout.
 * We skip compensation if the order was already marked paid.
 * @param {{ order_id: number, resolvedItems: object[], cartId: number|null, clearedCartLines: object[]|null }} created Created order
 * @returns {Promise<void>}
 */
async function compensateCheckout(created) {
    let paymentStatus = null;
    try {
        const order = await orderDAO.findById(created.order_id);
        paymentStatus = order.payment_status;
        if (paymentStatus === VALIDATIONS.PAYMENT_STATUS.PAID) {
            return;
        }
    } catch (err) {
        log.error("Order", "compensateCheckout", "failed to load order", err);
    }

    // restore the stock for the items
    try {
        await orderDAO.restoreStockForItems(created.resolvedItems);
    } catch (err) {
        log.error("Order", "compensateCheckout", "stock restore failed", err);
    }

    // if the payment status is unpaid, mark the payment status as failed
    if (paymentStatus === VALIDATIONS.PAYMENT_STATUS.UNPAID) {
        try {
            await orderDAO.updatePaymentStatus(
                created.order_id,
                VALIDATIONS.PAYMENT_STATUS.FAILED,
            );
        } catch (err) {
            log.error(
                "Order",
                "compensateCheckout",
                "failed to mark payment failed",
                err,
            );
        }
    }

    // restore the cart items
    if (created.cartId != null && created.clearedCartLines?.length) {
        try {
            await orderDAO.restoreCartItems(
                created.cartId,
                created.clearedCartLines,
            );
        } catch (err) {
            log.error(
                "Order",
                "compensateCheckout",
                "cart restore failed",
                err,
            );
        }
    }
}

/**
 * Creates an order (cart or body items), charges payment, confirms on success.
 * @param {object} input Checkout input
 * @param {number|null} input.userId User ID
 * @param {string|null} [input.guest_email] Guest email
 * @param {number|null} [input.cartId] Cart ID
 * @param {object[]} [input.items] Items
 * @param {object} input.shipping_address Shipping address
 * @param {object} [input.billing_address] Billing address
 * @param {string} input.payment_method Payment method
 * @param {object} [input.payment_details] Payment details JSON
 * @returns {Promise<object>} Checkout result
 * @throws {ConflictError} If payment was declined or validation fails
 * @throws {ValidationError} If validation fails
 */
async function runCheckout({
    userId,
    guest_email,
    cartId = null,
    items = null,
    shipping_address,
    billing_address,
    payment_method,
    payment_details,
}) {
    // resolve the tax rate and build the address records
    const taxRate = resolveTaxRate(shipping_address?.province);
    if (taxRate == null) {
        throw new ValidationError(
            "province must be a Canadian province or territory.",
        );
    }
    const addresses = buildAddressRecords(shipping_address, billing_address);

    // create the order with items
    const created = await orderDAO.createOrderWithItems({
        order: {
            user_id: userId,
            guest_email: userId == null ? guest_email : null,
        },
        addresses,
        cartId,
        items,
        taxRate,
    });

    // initialize the paid flag
    let paid = false;

    try {
        // validate the order for payment
        if (userId != null) {
            await validateOrderForPayment({
                order_id: created.order_id,
                user_id: userId,
                amount: created.total,
            });
        }

        const paymentResult = await paymentService.processPayment({
            user_id: userId,
            order_id: created.order_id,
            amount: created.total,
            payment_method,
            payment_details,
        });

        paid = paymentResult.payment_status === VALIDATIONS.PAYMENT_STATUS.PAID;

        if (!paid) {
            await compensateCheckout(created);
            throw new ConflictError("Payment was declined.", {
                order_id: created.order_id,
                payment_status: paymentResult.payment_status,
                order_status: VALIDATIONS.ORDER_STATUS.PENDING,
                subtotal: created.subtotal,
                tax: created.tax,
                total: created.total,
                payment: {
                    attempt_id: paymentResult.attempt_id,
                    status: paymentResult.status,
                    payment_method: paymentResult.payment_method,
                },
            });
        }

        // update the order status to confirmed
        await orderDAO.updateOrderStatus(
            created.order_id,
            VALIDATIONS.ORDER_STATUS.CONFIRMED,
        );

        // return the created order
        return {
            order_id: created.order_id,
            order_status: VALIDATIONS.ORDER_STATUS.CONFIRMED,
            payment_status: paymentResult.payment_status,
            subtotal: created.subtotal,
            tax: created.tax,
            total: created.total,
            payment: {
                attempt_id: paymentResult.attempt_id,
                status: paymentResult.status,
                payment_method: paymentResult.payment_method,
            },
        };
    } catch (err) {
        // if the error is a conflict error and the payment status is failed, throw the error
        if (
            err instanceof ConflictError &&
            err.details?.payment_status === VALIDATIONS.PAYMENT_STATUS.FAILED
        ) {
            throw err;
        }

        // if the order was not paid, compensate the checkout
        if (!paid) {
            await compensateCheckout(created);
        }

        throw err;
    }
}

export { roundCurrency, computeOrderTotals, buildAddressRecords, runCheckout };
