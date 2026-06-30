import { z } from "zod";
import { ValidationError } from "../../../utils/errors.js";
import { DEFAULTS, VALIDATIONS } from "../constants.js";
import { optionalPromoTypeSchema } from "../_promotions/promotionValidator.js";

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

// Schema(s)

const positiveInt = z.coerce.number().int().positive();

const browseFiltersSchema = z.looseObject({
    brand_id: positiveInt.optional(),
    model_id: positiveInt.optional(),
    condition: z.enum(VALIDATIONS.VEHICLE_CONDITIONS).optional(),
    year_min: z.coerce.number().int().optional(),
    year_max: z.coerce.number().int().optional(),
    price_min: z.coerce.number().min(0).optional(),
    price_max: z.coerce.number().min(0).optional(),
    mileage_max: z.coerce.number().int().min(0).optional(),
    body_shape: z.string().min(1).optional(),
    drivetrain: z.string().min(1).optional(),
    promo: optionalPromoTypeSchema,
});

const sortSchema = z.object({
    sort: z
        .enum(VALIDATIONS.SORT_VALUES, {
            error: () => ({
                message: `sort must be one of: ${VALIDATIONS.SORT_VALUES.join(", ")}`,
            }),
        })
        .default(DEFAULTS.SORT),
});

const searchSchema = z.object({
    q: z
        .string({ required_error: "q is required." })
        .min(VALIDATIONS.SEARCH.MIN_LENGTH, "Search query cannot be blank.")
        .max(
            VALIDATIONS.SEARCH.MAX_LENGTH,
            `Search query must not exceed ${VALIDATIONS.SEARCH.MAX_LENGTH} characters.`,
        ),
});

const compareSchema = z.object({
    cids: z
        .array(positiveInt)
        .min(
            VALIDATIONS.COMPARE.MIN_ITEMS,
            `Compare requires at least ${VALIDATIONS.COMPARE.MIN_ITEMS} items.`,
        )
        .max(
            VALIDATIONS.COMPARE.MAX_ITEMS,
            `Compare supports at most ${VALIDATIONS.COMPARE.MAX_ITEMS} items.`,
        ),
});

const catalogItemIdSchema = positiveInt;

/**
 * This function validates the browse filters.
 * @param {object} queryParams Query parameters
 * @returns {object}
 * @throws {ValidationError} If the browse filters are invalid
 */
function validateBrowseFilters(queryParams = {}) {
    const parsed = browseFiltersSchema.safeParse(queryParams);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates the sort parameters.
 * @param {object} queryParams Query parameters
 * @returns {object}
 * @throws {ValidationError} If the sort parameters are invalid
 */
function validateSortParams(queryParams = {}) {
    const parsed = sortSchema.safeParse(queryParams);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates the search query.
 * @param {object} queryParams Query parameters
 * @returns {object}
 * @throws {ValidationError} If the search query is invalid
 */
function validateSearchQuery(queryParams = {}) {
    const parsed = searchSchema.safeParse(queryParams);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function parses the compare cids query.
 * @param {object} queryParams Query parameters
 * @returns {unknown[]}
 */
function parseCompareCidsQuery(queryParams = {}) {
    const raw = queryParams.cids;

    if (raw == null) {
        return [];
    }

    if (Array.isArray(raw)) {
        return raw;
    }

    return String(raw)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
}

/**
 * This function validates the compare cids.
 * @param {unknown[]} cids
 * @returns {unknown[]}
 * @throws {ValidationError} If the compare cids are invalid
 */
function validateCompareCids(cids) {
    const parsed = compareSchema.safeParse({ cids });

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data.cids;
}

/**
 * This function validates the compare query.
 * @param {object} queryParams Query parameters
 * @returns {unknown[]}
 * @throws {ValidationError} If the compare query is invalid
 */
function validateCompareQuery(queryParams = {}) {
    return validateCompareCids(parseCompareCidsQuery(queryParams));
}

/**
 * This function validates the catalog item id.
 * @param {number} cid
 * @returns {number}
 * @throws {ValidationError} If the catalog item id is invalid
 */
function validateCatalogItemId(cid) {
    const parsed = catalogItemIdSchema.safeParse(cid);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

export {
    validateBrowseFilters,
    validateSortParams,
    validateSearchQuery,
    validateCompareQuery,
    validateCatalogItemId,
};
