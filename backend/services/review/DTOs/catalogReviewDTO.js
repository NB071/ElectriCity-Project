import { toReviewCore, toAuthorDTO } from "./reviewSharedDTO.js";

/**
 * This function maps the catalog review fields to a representable format.
 * @param {object} row DAO row (reviews joined with users)
 * @returns {object}
 */
function toCatalogReviewDTO(row) {
    return {
        ...toReviewCore(row),
        author: toAuthorDTO(row),
    };
}

export { toCatalogReviewDTO };
