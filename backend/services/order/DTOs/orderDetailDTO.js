import { toOrderItemDTO } from "./orderItemDTO.js";
import { toOrderAddressDTO } from "./orderSharedDTO.js";

/**
 * This function maps full order detail fields to a representable format.
 * @param {object} input
 * @param {object} input.order Order row
 * @param {object[]} input.items Order item rows
 * @param {Map<number, object[]>} input.optionsByConfigId Options keyed by config_id
 * @param {object[]} input.addresses Order address rows
 * @param {object[]} input.paymentAttempts Mapped payment attempt DTOs
 * @returns {object}
 */
function toOrderDetailDTO({
    order,
    items,
    optionsByConfigId,
    addresses,
    paymentAttempts,
}) {
    return {
        order_id: order.order_id,
        order_status: order.order_status,
        payment_status: order.payment_status,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        total: Number(order.total),
        additional_information: order.additional_information ?? null,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: items.map((row) =>
            toOrderItemDTO(row, optionsByConfigId.get(row.config_id) ?? []),
        ),
        addresses: addresses.map(toOrderAddressDTO),
        payment_attempts: paymentAttempts,
    };
}

export { toOrderDetailDTO };
