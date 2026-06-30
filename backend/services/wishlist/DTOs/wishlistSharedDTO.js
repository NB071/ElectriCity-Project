/**
 * This function maps the wishlist catalog item fields to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toWishlistCatalogItemDTO(row) {
    return {
        cid: row.cid,
        item_type: row.item_type,
        name: `${row.brand_name} ${row.model_name}`,
        base_price: Number(row.base_price),
        quantity: row.quantity,
        is_active: Boolean(row.is_active),
        primary_image_url: row.primary_image_url ?? null,
    };
}

export { toWishlistCatalogItemDTO };
