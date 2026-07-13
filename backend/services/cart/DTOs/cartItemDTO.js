import {
    resolveUnitPrice,
    toCartCatalogItemDTO,
    toCartConfigurationDTO,
} from "./cartSharedDTO.js";

/**
 * This function maps the cart item fields to a representable format.
 * @param {object} row DAO row
 * @param {object[]} [options] Selected options for row.config_id
 * @param {object[]} [promotions] Active promotions for row.cid
 * @returns {object}
 */
function toCartItemDTO(row, options = [], promotions = []) {
    const quantity = Number(row.quantity);
    const unitPrice = resolveUnitPrice(row);

    return {
        cart_item_id: row.cart_item_id,
        cid: row.cid,
        config_id: row.config_id ?? null,
        quantity,
        added_at: row.added_at,
        unit_price: unitPrice,
        line_total: unitPrice * quantity,
        catalog_item: toCartCatalogItemDTO(row, promotions),
        configuration: toCartConfigurationDTO(row, options),
    };
}

export { toCartItemDTO };
