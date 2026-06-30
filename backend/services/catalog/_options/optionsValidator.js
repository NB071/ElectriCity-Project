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

const catalogItemIdSchema = z.coerce
    .number()
    .int("cid must be an integer.")
    .positive("cid must be a positive integer.");

const createConfigurationOptionsSchema = z.object({
    cid: catalogItemIdSchema,
    option_ids: z
        .array(
            z.coerce
                .number()
                .int("option_id must be an integer.")
                .positive("option_id must be a positive integer."),
        )
        .min(1, "At least one option_id is required."),
});

/**
 * This function validates the catalog item ID.
 * @param {number} cid
 * @returns {number}
 * @throws {ValidationError} If the catalog item ID is invalid
 */
function validateCatalogItemId(cid) {
    const parsed = catalogItemIdSchema.safeParse(cid);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates the configuration options.
 * @param {object} data
 * @returns {object}
 * @throws {ValidationError} If the configuration options are invalid
 */
function validateConfigurationOptions(data) {
    const parsed = createConfigurationOptionsSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

export { validateCatalogItemId, validateConfigurationOptions };
