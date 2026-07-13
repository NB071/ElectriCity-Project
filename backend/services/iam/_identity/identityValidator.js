// IAM Identity Management
// Validation

import { z } from "zod";
import { ValidationError } from "../../../utils/errors.js";
import { VALIDATIONS } from "./constants.js";

/**
 * This function throws a validation error with a message and issues.
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

const userIdSchema = z.coerce
    .number({ required_error: "user_id is required." })
    .int("user_id must be an integer.")
    .positive("user_id must be a positive integer.");

const fieldFilterSchema = z
    .union([
        z.string().transform((value) =>
            value
                .split(",")
                .map((field) => field.trim())
                .filter(Boolean),
        ),
        z.array(z.string()),
    ])
    .optional()
    .transform((fields) => fields ?? []);

const profileFieldSchema = z.enum(VALIDATIONS.SELECTABLE_FIELDS, {
    error: () => ({
        message: `Each field must be one of: ${VALIDATIONS.SELECTABLE_FIELDS.join(", ")}`,
    }),
});

const getUserOptionsSchema = z.object({
    fields: fieldFilterSchema,
});

const updateProfileSchema = z
    .object({
        userId: userIdSchema,
        firstName: z
            .string()
            .trim()
            .min(1, "first_name cannot be empty.")
            .max(
                VALIDATIONS.NAME.MAX_LENGTH,
                `first_name must be at most ${VALIDATIONS.NAME.MAX_LENGTH} characters.`,
            )
            .optional(),
        lastName: z
            .string()
            .trim()
            .min(1, "last_name cannot be empty.")
            .max(
                VALIDATIONS.NAME.MAX_LENGTH,
                `last_name must be at most ${VALIDATIONS.NAME.MAX_LENGTH} characters.`,
            )
            .optional(),
        email: z
            .string()
            .trim()
            .max(
                VALIDATIONS.EMAIL.MAX_LENGTH,
                `email must be at most ${VALIDATIONS.EMAIL.MAX_LENGTH} characters.`,
            )
            // helper source: https://zod.dev/api?id=pipes#pipes
            .pipe(z.email("email must be a valid email address."))
            .optional(),
        phoneNumber: z
            .string()
            .trim()
            .max(
                VALIDATIONS.PHONE.MAX_LENGTH,
                `phone_number must be at most ${VALIDATIONS.PHONE.MAX_LENGTH} characters.`,
            )
            .nullable()
            .optional(),
        currentPassword: z
            .string()
            .min(1, "current_password is required when changing password.")
            .max(VALIDATIONS.PASSWORD.MAX_LENGTH)
            .optional(),
        newPassword: z
            .string()
            .min(
                VALIDATIONS.PASSWORD.MIN_LENGTH,
                `new_password must be at least ${VALIDATIONS.PASSWORD.MIN_LENGTH} characters.`,
            )
            .max(
                VALIDATIONS.PASSWORD.MAX_LENGTH,
                `new_password must be at most ${VALIDATIONS.PASSWORD.MAX_LENGTH} characters.`,
            )
            .optional(),
    })
    // helper source: https://zod.dev/api?id=superrefine#superrefine
    .superRefine((data, ctx) => {
        // check if at least one profile field is provided for update
        const profileFields = [
            data.firstName,
            data.lastName,
            data.email,
            data.phoneNumber,
            data.newPassword,
        ];
        const hasProfileChange = profileFields.some(
            (value) => value !== undefined,
        );

        // if no profile fields are provided for update, add an error
        if (!hasProfileChange) {
            ctx.addIssue({
                code: "custom",
                message:
                    "At least one profile field must be provided for update.",
                path: [],
            });
        }

        // if new password is provided but current password is not, add an error
        if (
            data.newPassword !== undefined &&
            data.currentPassword === undefined
        ) {
            ctx.addIssue({
                code: "custom",
                message: "current_password is required when changing password.",
                path: ["currentPassword"],
            });
        }
    });

const deleteProfileSchema = z.object({
    userId: userIdSchema,
});

const adminUserSearchSchema = z.object({
    q: z
        .string({ required_error: "q is required." })
        .trim()
        .min(
            VALIDATIONS.SEARCH.MIN_LENGTH,
            `q must be at least ${VALIDATIONS.SEARCH.MIN_LENGTH} character.`,
        )
        .max(
            VALIDATIONS.SEARCH.MAX_LENGTH,
            `q must be at most ${VALIDATIONS.SEARCH.MAX_LENGTH} characters.`,
        ),
});

const addressIdSchema = z.coerce
    .number({ required_error: "address_id is required." })
    .int("address_id must be an integer.")
    .positive("address_id must be a positive integer.");

const createAddressSchema = z.object({
    userId: userIdSchema,
    street: z
        .string({ required_error: "street is required." })
        .trim()
        .min(1, "street cannot be blank.")
        .max(
            VALIDATIONS.ADDRESS.STREET_MAX_LENGTH,
            `street must be at most ${VALIDATIONS.ADDRESS.STREET_MAX_LENGTH} characters.`,
        ),
    city: z
        .string({ required_error: "city is required." })
        .trim()
        .min(1, "city cannot be blank.")
        .max(
            VALIDATIONS.ADDRESS.CITY_MAX_LENGTH,
            `city must be at most ${VALIDATIONS.ADDRESS.CITY_MAX_LENGTH} characters.`,
        ),
    province: z
        .string({ required_error: "province is required." })
        .trim()
        .min(1, "province cannot be blank.")
        .max(
            VALIDATIONS.ADDRESS.PROVINCE_MAX_LENGTH,
            `province must be at most ${VALIDATIONS.ADDRESS.PROVINCE_MAX_LENGTH} characters.`,
        ),
    country: z
        .string({ required_error: "country is required." })
        .trim()
        .min(1, "country cannot be blank.")
        .max(
            VALIDATIONS.ADDRESS.COUNTRY_MAX_LENGTH,
            `country must be at most ${VALIDATIONS.ADDRESS.COUNTRY_MAX_LENGTH} characters.`,
        ),
    postalCode: z
        .string({ required_error: "postal_code is required." })
        .trim()
        .min(1, "postal_code cannot be blank.")
        .max(
            VALIDATIONS.ADDRESS.POSTAL_CODE_MAX_LENGTH,
            `postal_code must be at most ${VALIDATIONS.ADDRESS.POSTAL_CODE_MAX_LENGTH} characters.`,
        ),
    isDefault: z.boolean().optional().default(false),
});

const updateAddressSchema = z
    .object({
        userId: userIdSchema,
        addressId: addressIdSchema,
        street: z
            .string()
            .trim()
            .min(1, "street cannot be blank.")
            .max(
                VALIDATIONS.ADDRESS.STREET_MAX_LENGTH,
                `street must be at most ${VALIDATIONS.ADDRESS.STREET_MAX_LENGTH} characters.`,
            )
            .optional(),
        city: z
            .string()
            .trim()
            .min(1, "city cannot be blank.")
            .max(
                VALIDATIONS.ADDRESS.CITY_MAX_LENGTH,
                `city must be at most ${VALIDATIONS.ADDRESS.CITY_MAX_LENGTH} characters.`,
            )
            .optional(),
        province: z
            .string()
            .trim()
            .min(1, "province cannot be blank.")
            .max(
                VALIDATIONS.ADDRESS.PROVINCE_MAX_LENGTH,
                `province must be at most ${VALIDATIONS.ADDRESS.PROVINCE_MAX_LENGTH} characters.`,
            )
            .optional(),
        country: z
            .string()
            .trim()
            .min(1, "country cannot be blank.")
            .max(
                VALIDATIONS.ADDRESS.COUNTRY_MAX_LENGTH,
                `country must be at most ${VALIDATIONS.ADDRESS.COUNTRY_MAX_LENGTH} characters.`,
            )
            .optional(),
        postalCode: z
            .string()
            .trim()
            .min(1, "postal_code cannot be blank.")
            .max(
                VALIDATIONS.ADDRESS.POSTAL_CODE_MAX_LENGTH,
                `postal_code must be at most ${VALIDATIONS.ADDRESS.POSTAL_CODE_MAX_LENGTH} characters.`,
            )
            .optional(),
        isDefault: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
        const addressFields = [
            data.street,
            data.city,
            data.province,
            data.country,
            data.postalCode,
            data.isDefault,
        ];
        const hasChange = addressFields.some((value) => value !== undefined);

        if (!hasChange) {
            ctx.addIssue({
                code: "custom",
                message:
                    "At least one address field must be provided for update.",
                path: [],
            });
        }
    });

const addressRefSchema = z.object({
    userId: userIdSchema,
    addressId: addressIdSchema,
});

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
 * This function validates optional field filters for user lookups.
 * @param {object} [options]
 * @param {string|string[]|undefined} [options.fields] Comma-separated or array of field names
 * @returns {{ fields: string[] }}
 * @throws {ValidationError} If any field name is not allowed
 */
function validateGetUserOptions(options = {}) {
    const parsed = getUserOptionsSchema.safeParse(options);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    const { fields } = parsed.data;

    if (fields.length === 0) {
        return { fields: [] };
    }

    for (const field of fields) {
        const fieldParsed = profileFieldSchema.safeParse(field);

        if (!fieldParsed.success) {
            throwValidationError(fieldParsed.error);
        }
    }

    const uniqueFields = [...new Set(fields)];

    return { fields: uniqueFields };
}

/**
 * This function validates profile update input.
 * @param {object} data
 * @returns {object} Validated update payload
 * @throws {ValidationError} If validation fails
 */
function validateUpdateProfile(data) {
    const parsed = updateProfileSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates profile deletion input.
 * @param {object} data
 * @returns {{ userId: number }}
 * @throws {ValidationError} If validation fails
 */
function validateDeleteProfile(data) {
    const parsed = deleteProfileSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates admin user search query parameters.
 * @param {object} queryParams Raw query params (q)
 * @returns {{ q: string }}
 * @throws {ValidationError} If the search query is invalid
 */
function validateAdminUserSearchQuery(queryParams = {}) {
    const parsed = adminUserSearchSchema.safeParse(queryParams);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates input for creating a saved address.
 * userId must come from req.user.user_id, not the request body.
 * @param {object} data
 * @returns {object} Validated address payload
 * @throws {ValidationError} If validation fails
 */
function validateCreateAddress(data) {
    const parsed = createAddressSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates input for updating a saved address.
 * userId must come from req.user.user_id, not the request body.
 * @param {object} data
 * @returns {object} Validated address update payload
 * @throws {ValidationError} If validation fails
 */
function validateUpdateAddress(data) {
    const parsed = updateAddressSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates a reference to one of a user's saved addresses.
 * userId must come from req.user.user_id, not the request body.
 * @param {object} data
 * @returns {{ userId: number, addressId: number }}
 * @throws {ValidationError} If validation fails
 */
function validateAddressRef(data) {
    const parsed = addressRefSchema.safeParse(data);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

export {
    validateUserId,
    validateGetUserOptions,
    validateUpdateProfile,
    validateDeleteProfile,
    validateAdminUserSearchQuery,
    validateCreateAddress,
    validateUpdateAddress,
    validateAddressRef,
};
