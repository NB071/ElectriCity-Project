import { toReviewCore, toReviewCatalogItemDTO } from "./reviewSharedDTO.js";

/**
 * This function maps the customer review fields to a representable format.
 * @param {object} row DAO row
 * @returns {object}
 */
function toCustomerReviewDTO(row) {
    return {
        ...toReviewCore(row),
        catalog_item: toReviewCatalogItemDTO(row),
    };
}

export { toCustomerReviewDTO };
