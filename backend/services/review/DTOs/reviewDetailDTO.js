import {
    toReviewCore,
    toReviewUserDTO,
    toReviewCatalogItemDTO,
} from "./reviewSharedDTO.js";

/**
 * This function maps the review detail fields to a representable format.
 * @param {object} row DAO row
 * @returns {object}
 */
function toReviewDetailDTO(row) {
    return {
        ...toReviewCore(row),
        user: toReviewUserDTO(row),
        catalog_item: toReviewCatalogItemDTO(row),
    };
}

export { toReviewDetailDTO };
