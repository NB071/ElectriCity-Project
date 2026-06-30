// Wishlist Validation
// This file is used for validation of wishlist data

import { z } from "zod";
import { ValidationError } from "../../utils/errors.js";
import { VALIDATIONS, DEFAULTS } from "./constants.js";

const ALL_SORT_OPTIONS = VALIDATIONS.SORT_VALUES;

/**
 * @helper_function
 * @private
 * @param {import("zod").ZodError} zodError
 * @throws {ValidationError}
 * @see https://zod.dev/error-customization
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

const addToWishlistSchema = z.object({
    userId: z.coerce
        .number({ required_error: "userId is required." })
        .int("userId must be an integer.")
        .positive("userId must be a positive integer."),

    cid: z.coerce
        .number({ required_error: "cid is required." })
        .int("cid must be an integer.")
        .positive("cid must be a positive integer."),
});

const wishlistEntrySchema = z.object({
    userId: z.coerce
        .number({ required_error: "userId is required." })
        .int("userId must be an integer.")
        .positive("userId must be a positive integer."),

    cid: z.coerce
        .number({ required_error: "cid is required." })
        .int("cid must be an integer.")
        .positive("cid must be a positive integer."),
});

const sortParamsSchema = z.object({
    sort: z
        .enum(ALL_SORT_OPTIONS, {
            error: () => ({
                message: `sort must be one of: ${ALL_SORT_OPTIONS.join(", ")}`,
            }),
        })
        .default(DEFAULTS.SORT),
});

/**
 * This function validates the input for adding an item to a wishlist.
 * userId must come from req.user.user_id, not the request body.
 * @param {object} data The wishlist data to validate
 * @returns {{ userId: number, cid: number }}
 * @throws {ValidationError} If the wishlist data is invalid
 */
function validateAddToWishlist(data) {
    const parsed = addToWishlistSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates a wishlist entry lookup or removal.
 * userId must come from req.user.user_id, not the request body.
 * @param {object} data The wishlist entry data to validate
 * @returns {{ userId: number, cid: number }}
 * @throws {ValidationError} If the wishlist entry data is invalid
 */
function validateWishlistEntry(data) {
    const parsed = wishlistEntrySchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates a catalog item primary key.
 * @param {number|string} catalogItemId
 * @returns {number}
 * @throws {ValidationError} If the catalog item id is invalid
 */
function validateCatalogItemId(catalogItemId) {
    const parsed = z.coerce
        .number()
        .int("cid must be an integer.")
        .positive("cid must be a positive integer.")
        .safeParse(catalogItemId);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates a user primary key.
 * userId must come from req.user.user_id, not the request body.
 * @param {number|string} userId
 * @returns {number}
 * @throws {ValidationError} If the user id is invalid
 */
function validateUserId(userId) {
    const parsed = z.coerce
        .number()
        .int("user_id must be an integer.")
        .positive("user_id must be a positive integer.")
        .safeParse(userId);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates wishlist list query sort parameters.
 * @param {object} params Raw query params (sort)
 * @returns {{ sort: string }}
 * @throws {ValidationError} If the sort parameter is invalid
 */
function validateSortParams(params = {}) {
    const parsed = sortParamsSchema.safeParse(params);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

export {
    validateAddToWishlist,
    validateWishlistEntry,
    validateCatalogItemId,
    validateUserId,
    validateSortParams,
};
