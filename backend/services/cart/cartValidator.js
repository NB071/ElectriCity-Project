// Cart Validation
// This file is used for validation of cart data

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

const addToCartSchema = null;

const updateCartItemSchema = null;

const cartItemRefSchema = null;

const sortParamsSchema = null;

/**
 * This function validates the input for adding an item to a cart.
 * userId must come from req.user.user_id, not the request body.
 * @param {object} data
 * @returns {{ userId: number, cid: number, configId?: number|null, quantity: number }}
 * @throws {ValidationError} If the cart data is invalid
 */
function validateAddToCart(data) {
    // TODO: Implement
    throw new Error("Not implemented");
}

/**
 * This function validates the input for updating a cart item quantity.
 * userId must come from req.user.user_id, not the request body.
 * @param {object} data
 * @returns {{ userId: number, cartItemId: number, quantity: number }}
 * @throws {ValidationError} If the cart data is invalid
 */
function validateUpdateCartItem(data) {
    // TODO: Implement
    throw new Error("Not implemented");
}

/**
 * This function validates a cart item reference for removal.
 * userId must come from req.user.user_id, not the request body.
 * @param {object} data
 * @returns {{ userId: number, cartItemId: number }}
 * @throws {ValidationError} If the cart data is invalid
 */
function validateCartItemRef(data) {
    const parsed = cartItemRefSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates a cart item primary key.
 * @param {number|string} cartItemId
 * @returns {number}
 * @throws {ValidationError} If the cart item id is invalid
 */
function validateCartItemId(cartItemId) {
    // TODO: Implement
    throw new Error("Not implemented");
}

/**
 * This function validates a catalog item primary key.
 * @param {number|string} catalogItemId
 * @returns {number}
 * @throws {ValidationError} If the catalog item id is invalid
 */
function validateCatalogItemId(catalogItemId) {
    // TODO: Implement
    throw new Error("Not implemented");
}

/**
 * This function validates a user primary key.
 * userId must come from req.user.user_id, not the request body.
 * @param {number|string} userId
 * @returns {number}
 * @throws {ValidationError} If the user id is invalid
 */
function validateUserId(userId) {
    // TODO: Implement
    throw new Error("Not implemented");
}

/**
 * This function validates cart list query sort parameters.
 * @param {object} params Raw query params (sort)
 * @returns {{ sort: string }}
 * @throws {ValidationError} If the sort parameter is invalid
 */
function validateSortParams(params = {}) {
    // TODO: Implement
    throw new Error("Not implemented");
}

export {
    validateAddToCart,
    validateUpdateCartItem,
    validateCartItemRef,
    validateCartItemId,
    validateCatalogItemId,
    validateUserId,
    validateSortParams,
};
