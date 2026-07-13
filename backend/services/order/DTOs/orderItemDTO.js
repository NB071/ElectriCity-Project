import {
    resolveOrderItemUnitPrice,
    toOrderCatalogItemDTO,
    toOrderConfigurationDTO,
} from "./orderSharedDTO.js";

/**
 * This function maps the order item fields to a representable format.
 * @param {object} row DAO row
 * @param {object[]} [options] Selected options for row.config_id
 * @returns {object}
 */
function toOrderItemDTO(row, options = []) {
    const quantity = row.quantity;
    const unitPrice = resolveOrderItemUnitPrice(row);

    return {
        order_item_id: row.order_item_id,
        cid: row.cid,
        config_id: row.config_id ?? null,
        quantity,
        unit_price: unitPrice,
        line_total: unitPrice * quantity,
        catalog_item: toOrderCatalogItemDTO(row),
        configuration: toOrderConfigurationDTO(row, options),
    };
}

export { toOrderItemDTO };
