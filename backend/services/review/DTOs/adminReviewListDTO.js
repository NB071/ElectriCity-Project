import {
    toReviewCore,
    toReviewUserDTO,
    toReviewCatalogItemDTO,
} from "./reviewSharedDTO.js";

/**
 * This function maps the admin catalog review fields to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toAdminCatalogReviewDTO(row) {
    return {
        ...toReviewCore(row),
        user: toReviewUserDTO(row),
    };
}

/**
 * This function maps the admin review list fields to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toAdminReviewListDTO(row) {
    return {
        ...toReviewCore(row),
        user: toReviewUserDTO(row),
        catalog_item: toReviewCatalogItemDTO(row),
    };
}

export { toAdminCatalogReviewDTO, toAdminReviewListDTO };
