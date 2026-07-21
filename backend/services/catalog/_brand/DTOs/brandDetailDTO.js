import { toBrandLogoDTO } from "./brandLogoDTO.js";

/**
 * This function maps a brand database row to a detail representation.
 * @param {object} row DAO brand row
 * @returns {object}
 */
function toBrandDetailDTO(row) {
    return {
        id: row.brand_id,
        name: row.name,
        description: row.description ?? null,
        country: row.country ?? null,
        website_url: row.website_url ?? null,
        logo: toBrandLogoDTO(row),
        is_featured: Boolean(row.is_featured),
        display_order: row.display_order != null ? Number(row.display_order) : null,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

export { toBrandDetailDTO };
