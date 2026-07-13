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

// Schema(s)
const userIdSchema = z.coerce
    .number()
    .int("userId must be an integer.")
    .positive("userId must be a positive integer.");

const optionalUserIdSchema = z.preprocess(
    (value) =>
        value === undefined || value === null || value === "" ? null : value,
    z.union([userIdSchema, z.null()]),
);

const sessionTokenSchema = z
    .string()
    .uuid("sessionToken must be a valid UUID.")
    .length(
        VALIDATIONS.SESSION_TOKEN.LENGTH,
        `sessionToken must be ${VALIDATIONS.SESSION_TOKEN.LENGTH} characters.`,
    );

const optionalSessionTokenSchema = z.preprocess(
    (value) =>
        value === undefined || value === null || value === "" ? null : value,
    z.union([sessionTokenSchema, z.null()]),
);

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

/**
 * Owner is either an authenticated userId or a guest sessionToken (or neither yet guests may omit token on first request;
 *  ensureCartForGuest will mint one).
 */
const cartOwnerSchema = z
    .object({
        userId: optionalUserIdSchema.optional(),
        sessionToken: optionalSessionTokenSchema.optional(),
    })
    .transform((data) => ({
        userId: data.userId ?? null,
        sessionToken: data.sessionToken ?? null,
    }));

const addToCartSchema = z.object({
    userId: optionalUserIdSchema.optional(),
    sessionToken: optionalSessionTokenSchema.optional(),
    cid: catalogItemIdSchema,
    configId: configIdSchema.nullable().optional(),
    quantity: quantitySchema.default(DEFAULTS.QUANTITY),
});

const updateCartItemSchema = z
    .object({
        userId: optionalUserIdSchema.optional(),
        sessionToken: optionalSessionTokenSchema.optional(),
        cartItemId: cartItemIdSchema,
        quantity: quantitySchema,
    })
    .superRefine((data, ctx) => {
        if (data.userId == null && data.sessionToken == null) {
            ctx.addIssue({
                code: "custom",
                message: "Either authentication or X-Cart-Session is required.",
                path: ["sessionToken"],
            });
        }
    });

const cartItemRefSchema = z
    .object({
        userId: optionalUserIdSchema.optional(),
        sessionToken: optionalSessionTokenSchema.optional(),
        cartItemId: cartItemIdSchema,
    })
    .superRefine((data, ctx) => {
        if (data.userId == null && data.sessionToken == null) {
            ctx.addIssue({
                code: "custom",
                message: "Either authentication or X-Cart-Session is required.",
                path: ["sessionToken"],
            });
        }
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

const mergeGuestCartSchema = z.object({
    userId: userIdSchema,
    sessionToken: sessionTokenSchema,
});

/**
 * Validates cart owner (user and/or guest session).
 * @param {object} data
 * @returns {{ userId: number|null, sessionToken: string|null }}
 * @throws {ValidationError}
 */
function validateCartOwner(data) {
    const parsed = cartOwnerSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates the input for adding an item to a cart.
 * @param {object} data
 * @returns {object}
 * @throws {ValidationError} If the cart data is invalid
 */
function validateAddToCart(data) {
    const parsed = addToCartSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return {
        ...parsed.data,
        userId: parsed.data.userId ?? null,
        sessionToken: parsed.data.sessionToken ?? null,
    };
}

/**
 * This function validates the input for updating a cart item quantity.
 * @param {object} data
 * @returns {object}
 * @throws {ValidationError} If the cart data is invalid
 */
function validateUpdateCartItem(data) {
    const parsed = updateCartItemSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return {
        ...parsed.data,
        userId: parsed.data.userId ?? null,
        sessionToken: parsed.data.sessionToken ?? null,
    };
}

/**
 * This function validates a cart item reference for removal.
 * @param {object} data
 * @returns {object}
 * @throws {ValidationError} If the cart data is invalid
 */
function validateCartItemRef(data) {
    const parsed = cartItemRefSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return {
        ...parsed.data,
        userId: parsed.data.userId ?? null,
        sessionToken: parsed.data.sessionToken ?? null,
    };
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

/**
 * Validates merge-guest-cart-into-user input.
 * @param {object} data
 * @returns {{ userId: number, sessionToken: string }}
 * @throws {ValidationError}
 */
function validateMergeGuestCart(data) {
    const parsed = mergeGuestCartSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

export {
    validateCartOwner,
    validateAddToCart,
    validateUpdateCartItem,
    validateCartItemRef,
    validateCartItemId,
    validateCatalogItemId,
    validateUserId,
    validateSortParams,
    validateMergeGuestCart,
};
