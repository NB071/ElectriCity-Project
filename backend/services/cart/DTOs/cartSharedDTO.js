/**
 * This function resolves the unit price for a cart item.
 * @param {object} row
 * @returns {number}
 */
function resolveUnitPrice(row) {
    if (row.config_id != null) {
        return Number(row.config_total_price ?? row.total_price);
    }

    return Number(row.base_price);
}

/**
 * This function maps the cart catalog item fields to a representable format.
 * @param {object} row
 * @param {object[]} [promotions]
 * @returns {object}
 */
function toCartCatalogItemDTO(row, promotions = []) {
    return {
        cid: row.cid,
        item_type: row.item_type,
        name: `${row.brand_name} ${row.model_name}`,
        base_price: Number(row.base_price),
        stock: Number(row.stock),
        is_active: Boolean(row.is_active),
        primary_image_url: row.primary_image_url ?? null,
        promotions,
    };
}

/**
 * This function maps the cart configuration option fields to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toCartConfigurationOptionDTO(row) {
    return {
        category_id: row.category_id,
        category_name: row.category_name,
        select_type: row.select_type,
        option_id: row.option_id,
        name: row.name ?? row.option_name ?? row.value_name,
        price_delta: Number(row.price_delta),
    };
}

/**
 * This function maps the cart configuration fields to a representable format.
 * @param {object} row
 * @param {object[]} [options]
 * @returns {object|null}
 */
function toCartConfigurationDTO(row, options = []) {
    if (row.config_id == null) {
        return null;
    }

    return {
        config_id: row.config_id,
        total_price: Number(row.config_total_price ?? row.total_price),
        created_at: row.config_created_at ?? row.created_at,
        options: options.map(toCartConfigurationOptionDTO),
    };
}

export {
    resolveUnitPrice,
    toCartCatalogItemDTO,
    toCartConfigurationOptionDTO,
    toCartConfigurationDTO,
};
