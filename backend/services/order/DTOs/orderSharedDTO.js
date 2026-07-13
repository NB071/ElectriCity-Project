/**
 * This function resolves the unit price for an order line item.
 * Order items freeze unit_price at the time of purchase, unlike cart items
 * which derive their price live from the catalog/configuration.
 * @param {object} row
 * @returns {number}
 */
function resolveOrderItemUnitPrice(row) {
    return Number(row.unit_price);
}

/**
 * This function maps an order configuration option row to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toOrderConfigurationOptionDTO(row) {
    return {
        category_id: row.category_id,
        category_name: row.category_name,
        select_type: row.select_type,
        option_id: row.option_id,
        name: row.option_name,
        price_delta: Number(row.price_delta),
    };
}

/**
 * This function maps the order catalog item fields to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toOrderCatalogItemDTO(row) {
    return {
        cid: row.cid,
        item_type: row.item_type,
        name: `${row.brand_name} ${row.model_name}`,
        base_price: Number(row.base_price),
        is_active: Boolean(row.is_active),
    };
}

/**
 * This function maps the order configuration fields to a representable format.
 * @param {object} row
 * @param {object[]} [options]
 * @returns {object|null}
 */
function toOrderConfigurationDTO(row, options = []) {
    if (row.config_id == null) {
        return null;
    }

    return {
        config_id: row.config_id,
        total_price: Number(row.config_total_price),
        created_at: row.config_created_at,
        options: options.map(toOrderConfigurationOptionDTO),
    };
}

/**
 * This function maps an order address row to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toOrderAddressDTO(row) {
    return {
        address_type: row.address_type,
        full_name: row.full_name,
        phone_number: row.phone_number ?? null,
        street: row.street,
        city: row.city,
        province: row.province,
        country: row.country,
        postal_code: row.postal_code,
    };
}

export {
    resolveOrderItemUnitPrice,
    toOrderConfigurationOptionDTO,
    toOrderCatalogItemDTO,
    toOrderConfigurationDTO,
    toOrderAddressDTO,
};
