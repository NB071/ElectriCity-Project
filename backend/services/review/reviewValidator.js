// Review Validation
// This file is used for validation of review data

import { z } from "zod";
import { VALIDATIONS } from "./constants.js";
import { ValidationError } from "../../utils/errors.js";

// schema definition(s)
const idSchema = z.coerce.number().int().positive();

const publishReviewSchema = z.object({
    userId: idSchema,
    cid: idSchema,
    title: z
        .string()
        .trim()
        .max(VALIDATIONS.REVIEW_LIMITS.TITLE_MAX)
        .nullable()
        .optional(),
    body: z.string().trim().min(1),
    rating: z.coerce
        .number()
        .int()
        .min(VALIDATIONS.RATING.MIN)
        .max(VALIDATIONS.RATING.MAX),
});

/**
 * This helper parses data against a schema and throws a ValidationError on failure.
 * @param {import('zod').ZodType} schema
 * @param {unknown} data
 * @param {string} message Error message used when validation fails
 * @returns {unknown} The parsed, validated data
 * @throws {ValidationError} If validation fails
 */
function parseOrThrow(schema, data, message) {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new ValidationError(message, result.error.issues);
    }
    return result.data;
}

/**
 * This function validates the input for publishing a review.
 * userId must come from req.user.user_id, not the request body.
 * @param {object} data The review data to validate
 * @returns {object} The validated review data
 * @throws {ValidationError} If the review data is invalid
 */
function validatePublishReview(data) {
    return parseOrThrow(publishReviewSchema, data, "Invalid review input");
}

/**
 * This function validates a review primary key (review_id / rid).
 * @param {number|string} reviewId
 * @returns {number}
 * @throws {ValidationError} If the review id is invalid
 */
function validateReviewId(reviewId) {
    return parseOrThrow(idSchema, reviewId, "Invalid review id");
}

/**
 * This function validates a catalog item primary key.
 * @param {number|string} catalogItemId
 * @returns {number}
 * @throws {ValidationError} If the catalog item id is invalid
 */
function validateCatalogItemId(catalogItemId) {
    return parseOrThrow(idSchema, catalogItemId, "Invalid catalog item id");
}

/**
 * This function validates a user primary key.
 * userId must come from req.user.user_id, not the request body.
 * @param {number|string} userId
 * @returns {number}
 * @throws {ValidationError} If the user id is invalid
 */
function validateUserId(userId) {
    return parseOrThrow(idSchema, userId, "Invalid user id");
}

export {
    validatePublishReview,
    validateReviewId,
    validateCatalogItemId,
    validateUserId,
};
