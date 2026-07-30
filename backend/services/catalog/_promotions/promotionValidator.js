import { z } from "zod";
import { ValidationError } from "../../../utils/errors.js";
import { VALIDATIONS } from "../constants.js";

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

const promoTypeSchema = z.enum(VALIDATIONS.PROMO_TYPES, {
    error: () => ({
        message: `promo must be one of: ${VALIDATIONS.PROMO_TYPES.join(", ")}`,
    }),
});

const optionalPromoTypeSchema = promoTypeSchema.optional();

const optionalPromoValuesSchema = z
    .union([z.string(), z.array(z.string())])
    .transform((value) =>
        (Array.isArray(value) ? value : value.split(","))
            .map((entry) => entry.trim())
            .filter(Boolean),
    )
    .pipe(
        z
            .array(promoTypeSchema)
            .min(1, "promo must contain at least one value"),
    )
    .optional();

/**
 * This function validates the promotion type.
 * @param {string} promoType
 * @returns {string}
 * @throws {ValidationError} If the promotion type is not valid
 */
function validatePromoType(promoType) {
    const parsed = promoTypeSchema.safeParse(promoType);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

export {
    validatePromoType,
    optionalPromoTypeSchema,
    optionalPromoValuesSchema,
};
