// Cart Service (DTOs)

import { resolveUnitPrice } from "./cartSharedDTO.js";

/**
 * This function maps a cart line to a lite header-preview representation
 * (no configuration options or promotions).
 * @param {object} row DAO row from findSummaryPreviewByCartId
 * @returns {object}
 */
function toCartSummaryPreviewItemDTO(row) {
    const quantity = Number(row.quantity);
    const unitPrice = resolveUnitPrice(row);

    return {
        cart_item_id: row.cart_item_id,
        cid: row.cid,
        name: `${row.brand_name} ${row.model_name}`,
        quantity,
        unit_price: unitPrice,
        line_total: unitPrice * quantity,
        primary_image_url: row.primary_image_url ?? null,
    };
}

/**
 * This function builds the cart summary payload for the shop header.
 * @param {object} params
 * @param {number|null} params.cartId
 * @param {{ item_count: number, quantity_total: number, subtotal: number }} params.aggregates
 * @param {object[]} params.preview
 * @param {number} params.previewLimit
 * @param {{ session_token: string|null, is_guest: boolean }} params.ownerMeta
 * @returns {object}
 */
function toCartSummaryDTO({
    cartId,
    aggregates,
    preview,
    previewLimit,
    ownerMeta,
}) {
    return {
        cart_id: cartId,
        item_count: Number(aggregates.item_count ?? 0),
        quantity_total: Number(aggregates.quantity_total ?? 0),
        subtotal: Number(aggregates.subtotal ?? 0),
        preview,
        preview_limit: previewLimit,
        ...ownerMeta,
    };
}

export { toCartSummaryPreviewItemDTO, toCartSummaryDTO };
