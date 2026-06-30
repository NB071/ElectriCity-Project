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

const createConfigurationSchema = z.object({
    cid: z.coerce
        .number()
        .int("cid must be an integer.")
        .positive("cid must be a positive integer."),
    option_ids: z
        .array(
            z.coerce
                .number()
                .int("option_id must be an integer.")
                .positive("option_id must be a positive integer."),
        )
        .min(1, "At least one option_id is required."),
});

const configIdSchema = z.coerce
    .number()
    .int("config_id must be an integer.")
    .positive("config_id must be a positive integer.");

/**
 * This function validates the create configuration data.
 * @param {object} data
 * @returns {object}
 * @throws {ValidationError} If the create configuration data is invalid
 */
function validateCreateConfiguration(data) {
    const parsed = createConfigurationSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates the configuration ID.
 * @param {number} configId
 * @returns {number}
 * @throws {ValidationError} If the configuration ID is invalid
 */
function validateConfigId(configId) {
    const parsed = configIdSchema.safeParse(configId);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

export { validateCreateConfiguration, validateConfigId };
