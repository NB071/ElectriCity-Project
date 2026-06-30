// Review Validation
// This file is used for validation of review data

import { z } from "zod";
import { VALIDATIONS } from "./constants.js";
import { validatePaginationParams } from "../../utils/pagination.js";

// schema definition(s)
// TODO: Implement schema definitions
const publishReviewSchema = null;

const paginationParamsSchema = null;

// Validators
// TODO: Implement validators
/**
 * This function validates the input for publishing a review.
 * userId must come from req.user.user_id, not the request body.
 * @param {object} data The review data to validate
 * @returns {object} The validated review data
 * @throws {Error} If the review data is invalid
 */
function validatePublishReview(data) {
    // TODO:
    throw new Error("Not implemented");
}

/**
 * This function validates a review primary key (review_id / rid).
 * @param {number|string} reviewId
 * @returns {number}
 * @throws {Error} If the review id is invalid
 */
function validateReviewId(reviewId) {
    // TODO:
    throw new Error("Not implemented");
}

/**
 * This function validates a catalog item primary key.
 * @param {number|string} catalogItemId
 * @returns {number}
 * @throws {Error} If the catalog item id is invalid
 */
function validateCatalogItemId(catalogItemId) {
    // TODO:
    throw new Error("Not implemented");
}

/**
 * This function validates a user primary key.
 * userId must come from req.user.user_id, not the request body.
 * @param {number|string} userId
 * @returns {number}
 * @throws {Error} If the user id is invalid
 */
function validateUserId(userId) {
    // TODO:
    throw new Error("Not implemented");
}

export {
    validatePublishReview,
    validateReviewId,
    validateCatalogItemId,
    validateUserId,
};
