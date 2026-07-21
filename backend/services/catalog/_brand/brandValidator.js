import { z } from "zod";
import { ValidationError } from "../../../utils/errors.js";

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

const brandIdSchema = z.coerce
    .number()
    .int("brandId must be an integer.")
    .positive("brandId must be a positive integer.");

/**
 * This function coerces common query-string boolean forms ("true"/"1"/...) to a real boolean.
 * @helper_function
 * @private
 * @param {string} fieldName
 */
function booleanQuerySchema(fieldName) {
    return z.preprocess(
        (value) => {
            if (typeof value === "boolean") {
                return value;
            }
            if (typeof value !== "string") {
                return value;
            }

            const normalized = value.trim().toLowerCase();
            if (["true", "1", "yes"].includes(normalized)) {
                return true;
            }
            if (["false", "0", "no"].includes(normalized)) {
                return false;
            }

            return value;
        },
        z.boolean({
            error: () => ({ message: `${fieldName} must be a boolean.` }),
        }),
    );
}

const listBrandsQuerySchema = z.looseObject({
    is_featured: booleanQuerySchema("is_featured").optional(),
    lite: booleanQuerySchema("lite").optional(),
});

/**
 * This function validates a brand ID path/param value.
 * @param {number|string} brandId
 * @returns {number}
 * @throws {ValidationError} If the brand ID is invalid
 */
function validateBrandId(brandId) {
    const parsed = brandIdSchema.safeParse(brandId);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates brand list query parameters.
 * @param {object} [queryParams]
 * @returns {{ is_featured?: boolean, lite?: boolean }}
 * @throws {ValidationError} If the list query is invalid
 */
function validateListBrandsQuery(queryParams = {}) {
    const parsed = listBrandsQuerySchema.safeParse(queryParams);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return {
        is_featured: parsed.data.is_featured,
        lite: parsed.data.lite,
    };
}

export { validateBrandId, validateListBrandsQuery };
