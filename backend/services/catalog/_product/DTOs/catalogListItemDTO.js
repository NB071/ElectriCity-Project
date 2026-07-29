/**
 * This function maps the catalog list item to a representable format.
 * @param {object} row Catalog list item row
 * @param {object[]} [images] Preview images ordered by display_order (max 5 from query layer)
 * @param {object[]} [promotions]
 * @returns {object}
 */
function toCatalogListItemDTO(row, images = [], promotions = []) {
    const primary =
        images.find((image) => Boolean(image.is_primary)) ?? images[0] ?? null;

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
        primary_image_url: primary?.url ?? null,
        image_urls: images
            .map((image) => image.url)
            .filter((url) => typeof url === "string" && url.length > 0),
        promotions,
        vehicle:
            row.item_type === "vehicle"
                ? {
                      year: row.year,
                      condition: row.condition,
                      mileage: row.mileage,
                      exterior_color: row.exterior_color,
                      interior_color: row.interior_color,
                      body_shape: row.body_shape,
                      door_count: row.door_count,
                      drivetrain: row.drivetrain,
                  }
                : null,
    };
}

export { toCatalogListItemDTO };
