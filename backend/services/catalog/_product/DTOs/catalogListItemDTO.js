/**
 * This function maps the catalog list item to a representable format.
 * @param {object} row Catalog list item row
 * @param {object|null} primaryImage Primary image of the catalog item
 * @param {object[]} [promotions]
 * @returns {object}
 */
function toCatalogListItemDTO(row, primaryImage = null, promotions = []) {
    return {
        id: row.cid,
        item_type: row.item_type,
        name: `${row.brand_name} ${row.model_name}`,
        brand: {
            id: row.brand_id,
            name: row.brand_name,
        },
        model: {
            id: row.model_id,
            name: row.model_name,
        },
        base_price: Number(row.base_price),
        stock: row.quantity,
        is_active: Boolean(row.is_active),
        primary_image_url: primaryImage?.url ?? null,
        promotions,
        vehicle:
            row.item_type === "vehicle"
                ? {
                      year: row.year,
                      condition: row.condition,
                      mileage: row.mileage,
                      body_shape: row.body_shape,
                      door_count: row.door_count,
                      drivetrain: row.drivetrain,
                  }
                : null,
    };
}

export { toCatalogListItemDTO };
