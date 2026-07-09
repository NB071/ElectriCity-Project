// Review Validation
// This file is used for validation of review data

import { z } from "zod";
import { VALIDATIONS } from "./constants.js";
import { ValidationError } from "../../utils/errors.js";

/**
 * This function throws a validation error.
 * @helper_function
 * @private
 * @param {import("zod").ZodError} zodError
 * @throws {ValidationError}
 */
function throwValidationError(zodError) {
    const message = zodError.issues
        .map((issue) =>
            issue.path.length > 0
                ? `"${issue.path.join(".")}" : ${issue.message}`
                : issue.message,
        )
        .join(", ");

    throw new ValidationError(message, zodError.issues);
}

// schema definition(s)
const idSchema = z.coerce
    .number("id must be a number")
    .int("id must be an integer")
    .positive("id must be a positive integer");

const publishReviewSchema = z.object({
    userId: idSchema,
    cid: idSchema,
    // ref: https://zod.dev/api?id=preprocess#preprocess
    title: z.preprocess((val) => {
        if (val === undefined || val === null) {
            return null;
        }
        const trimmed = String(val).trim();
        return trimmed.length === 0 ? null : trimmed;
    }, z.string().max(VALIDATIONS.REVIEW_LIMITS.TITLE_MAX, "title must be at most 150 characters").nullable()),
    body: z
        .string("body must be a string")
        .trim()
        .min(1, "body must be at least 1 character")
        .max(
            VALIDATIONS.REVIEW_LIMITS.BODY_MAX,
            `body must be at most ${VALIDATIONS.REVIEW_LIMITS.BODY_MAX} characters`,
        ),
    rating: z.coerce
        .number("rating must be a number")
        .int("rating must be an integer")
        .min(VALIDATIONS.RATING.MIN, "rating must be at least 1")
        .max(VALIDATIONS.RATING.MAX, "rating must be at most 5"),
});

/**
 * This function validates the input for publishing a review.
 * @param {object} data The review data to validate
 * @returns {object} The validated review data
 * @throws {ValidationError} If the review data is invalid
 */
function validatePublishReview(data) {
    const result = publishReviewSchema.safeParse(data);
    if (!result.success) {
        throwValidationError(result.error);
    }
    return result.data;
}

/**
 * This function validates a review primary key (review_id / rid).
 * @param {number|string} reviewId
 * @returns {number}
 * @throws {ValidationError} If the review id is invalid
 */
function validateReviewId(reviewId) {
    const result = idSchema.safeParse(reviewId);
    if (!result.success) {
        throwValidationError(result.error);
    }
    return result.data;
}

/**
 * This function validates a catalog item primary key.
 * @param {number|string} catalogItemId
 * @returns {number}
 * @throws {ValidationError} If the catalog item id is invalid
 */
function validateCatalogItemId(catalogItemId) {
    const result = idSchema.safeParse(catalogItemId);
    if (!result.success) {
        throwValidationError(result.error);
    }
    return result.data;
}

/**
 * This function validates a user primary key.
 * @param {number|string} userId
 * @returns {number}
 * @throws {ValidationError} If the user id is invalid
 */
function validateUserId(userId) {
    const result = idSchema.safeParse(userId);
    if (!result.success) {
        throwValidationError(result.error);
    }
    return result.data;
}

export {
    validatePublishReview,
    validateReviewId,
    validateCatalogItemId,
    validateUserId,
};
