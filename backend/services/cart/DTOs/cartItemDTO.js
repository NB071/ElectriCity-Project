import {
    resolveUnitPrice,
    toCartCatalogItemDTO,
    toCartConfigurationDTO,
} from "./cartSharedDTO.js";

/**
 * This function maps the cart item fields to a representable format.
 * @param {object} row DAO row
 * @param {object[]} [options] Selected options for row.config_id
 * @returns {object}
 */
function toCartItemDTO(row, options = []) {
    const quantity = row.quantity;
    const unitPrice = resolveUnitPrice(row);

    return {
        cart_item_id: row.cart_item_id,
        cid: row.cid,
        config_id: row.config_id ?? null,
        quantity,
        added_at: row.added_at,
        unit_price: unitPrice,
        line_total: unitPrice * quantity,
        catalog_item: toCartCatalogItemDTO(row),
        configuration: toCartConfigurationDTO(row, options),
    };
}

export { toCartItemDTO };
