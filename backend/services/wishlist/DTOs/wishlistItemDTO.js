import { toWishlistCatalogItemDTO } from "./wishlistSharedDTO.js";

/**
 * This function maps the wishlist item fields to a representable format.
 * @param {object} row DAO row
 * @returns {object}
 */
function toWishlistItemDTO(row) {
    return {
        cid: row.cid,
        added_at: row.added_at,
        catalog_item: toWishlistCatalogItemDTO(row),
    };
}

export { toWishlistItemDTO };
