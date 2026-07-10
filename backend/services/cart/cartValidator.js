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

const userIdSchema = z.coerce
    .number()
    .int("userId must be an integer.")
    .positive("userId must be a positive integer.");

const cartItemIdSchema = z.coerce
    .number()
    .int("cartItemId must be an integer.")
    .positive("cartItemId must be a positive integer.");

const catalogItemIdSchema = z.coerce
    .number()
    .int("cid must be an integer.")
    .positive("cid must be a positive integer.");

const configIdSchema = z.coerce
    .number()
    .int("configId must be an integer.")
    .positive("configId must be a positive integer.");

const quantitySchema = z.coerce
    .number()
    .int("quantity must be an integer.")
    .min(
        VALIDATIONS.QUANTITY.MIN,
        `quantity must be at least ${VALIDATIONS.QUANTITY.MIN}.`,
    )
    .max(
        VALIDATIONS.QUANTITY.MAX,
        `quantity must be at most ${VALIDATIONS.QUANTITY.MAX}.`,
    );

const addToCartSchema = z.object({
    userId: userIdSchema,
    cid: catalogItemIdSchema,
    configId: configIdSchema.nullable().optional(),
    quantity: quantitySchema.default(DEFAULTS.QUANTITY),
});

const updateCartItemSchema = z.object({
    userId: userIdSchema,
    cartItemId: cartItemIdSchema,
    quantity: quantitySchema,
});

const cartItemRefSchema = z.object({
    userId: userIdSchema,
    cartItemId: cartItemIdSchema,
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
 * This function validates the input for adding an item to a cart.
 * userId must come from req.user.user_id, not the request body.
 * @param {object} data
 * @returns {{ userId: number, cid: number, configId?: number|null, quantity: number }}
 * @throws {ValidationError} If the cart data is invalid
 */
function validateAddToCart(data) {
    const parsed = addToCartSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates the input for updating a cart item quantity.
 * userId must come from req.user.user_id, not the request body.
 * @param {object} data
 * @returns {{ userId: number, cartItemId: number, quantity: number }}
 * @throws {ValidationError} If the cart data is invalid
 */
function validateUpdateCartItem(data) {
    const parsed = updateCartItemSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
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
    const parsed = cartItemIdSchema.safeParse(cartItemId);

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
    const parsed = catalogItemIdSchema.safeParse(catalogItemId);

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
    const parsed = userIdSchema.safeParse(userId);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates cart list query sort parameters.
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
    validateAddToCart,
    validateUpdateCartItem,
    validateCartItemRef,
    validateCartItemId,
    validateCatalogItemId,
    validateUserId,
    validateSortParams,
};
