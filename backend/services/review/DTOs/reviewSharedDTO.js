/**
 * This function maps the review core fields to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toReviewCore(row) {
    return {
        review_id: row.review_id,
        title: row.title ?? null,
        body: row.body ?? null,
        rating: row.rating,
        created_at: row.created_at,
    };
}

/**
 * This function maps the review author fields to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toAuthorDTO(row) {
    return {
        user_id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
    };
}

/**
 * This function maps the review user fields to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toReviewUserDTO(row) {
    return {
        user_id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
    };
}

/**
 * This function maps the review catalog item fields to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toReviewCatalogItemDTO(row) {
    return {
        cid: row.cid,
        item_type: row.item_type,
        name: `${row.brand_name} ${row.model_name}`,
        primary_image_url: row.primary_image_url ?? null,
    };
}

export { toReviewCore, toAuthorDTO, toReviewUserDTO, toReviewCatalogItemDTO };
