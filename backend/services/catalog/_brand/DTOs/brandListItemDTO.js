import { toBrandLogoDTO } from "./brandLogoDTO.js";

/**
 * This function maps a brand database row to a list representation.
 * @param {object} row DAO brand row
 * @returns {object}
 */
function toBrandListItemDTO(row) {
    return {
        id: row.brand_id,
        name: row.name,
        country: row.country ?? null,
        logo: toBrandLogoDTO(row),
        is_featured: Boolean(row.is_featured),
        display_order: row.display_order != null ? Number(row.display_order) : null,
    };
}

export { toBrandListItemDTO };
