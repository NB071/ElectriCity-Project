import { roundCurrency } from "../helpers/orderTotals.js";

/**
 * Maps a resolved checkout line into the public checkout response shape.
 * @param {object} item
 * @returns {object}
 */
function toCheckoutLineItemDTO(item) {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unit_price);
    return {
        cid: Number(item.cid),
        config_id: item.config_id == null ? null : Number(item.config_id),
        name: item.name ?? `Catalog item ${item.cid}`,
        quantity,
        unit_price: unitPrice,
        line_total: roundCurrency(unitPrice * quantity),
    };
}

/**
 * Maps a successful checkout into the public API response.
 * @param {object} input
 * @returns {object}
 */
function toCheckoutResultDTO({
    order_id,
    order_status,
    payment_status,
    subtotal,
    tax,
    total,
    payment,
    items,
}) {
    return {
        order_id: Number(order_id),
        order_status,
        payment_status,
        subtotal: Number(subtotal),
        tax: Number(tax),
        total: Number(total),
        payment: {
            attempt_id: Number(payment.attempt_id),
            status: payment.status,
            payment_method: payment.payment_method,
        },
        items: (items ?? []).map(toCheckoutLineItemDTO),
    };
}

/**
 * Maps checkout lines into the order-confirm email template vars shape.
 * @param {object[]} items
 * @returns {{ name: string, quantity: number, price: number }[]}
 */
function toOrderConfirmEmailItems(items) {
    return (items ?? []).map((item) => ({
        name: item.name ?? `Catalog item ${item.cid}`,
        quantity: Number(item.quantity),
        price: Number(item.unit_price),
    }));
}

export { toCheckoutLineItemDTO, toCheckoutResultDTO, toOrderConfirmEmailItems };
