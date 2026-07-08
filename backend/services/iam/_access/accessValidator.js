// IAM Access Management
// Validation

import { VALIDATIONS, AUTH_HEADERS } from "./constants.js";
import { z } from "zod";
import { ValidationError } from "../../../utils/errors.js";

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

// Schema definition(s)
const registerSchema = z.object({
    firstName: z.string().trim().min(1).max(VALIDATIONS.NAME.MAX_LENGTH),
    lastName: z.string().trim().min(1).max(VALIDATIONS.NAME.MAX_LENGTH),
    email: z.email().max(VALIDATIONS.EMAIL.MAX_LENGTH),
    password: z
        .string()
        .min(VALIDATIONS.PASSWORD.MIN_LENGTH)
        .max(VALIDATIONS.PASSWORD.MAX_LENGTH),
    phoneNumber: z
        .string()
        .trim()
        .max(VALIDATIONS.PHONE.MAX_LENGTH)
        .nullable()
        .optional(),
});

const loginSchema = z.object({
    email: z.email().max(VALIDATIONS.EMAIL.MAX_LENGTH),
    password: z.string().min(1).max(VALIDATIONS.PASSWORD.MAX_LENGTH),
});

const allowedRolesSchema = z.enum(Object.values(VALIDATIONS.ROLES));

const refreshTokenSchema = z.string().min(1);

const bearerTokenSchema = z
    .string()
    .trim()
    .refine((header) => /^bearer\s+/i.test(header), {
        message: `Authorization header must start with "${AUTH_HEADERS.BEARER_PREFIX.trim()}"`,
    })
    .transform((header) => header.replace(/^bearer\s+/i, "").trim())
    .pipe(z.string().min(1));

const logoutSchema = z.object({
    userId: z.number().int().positive(),
    sid: z.string().length(VALIDATIONS.SESSION_ID.LENGTH),
});

const logoutAllSchema = z.object({
    userId: z.number().int().positive(),
});

const listUserSessionsSchema = z.object({
    userId: z.number().int().positive(),
    currentSessionId: z.string().length(VALIDATIONS.SESSION_ID.LENGTH),
});

/**
 * This function validates registration input.
 * @param {object} data
 * @param {string} data.firstName
 * @param {string} data.lastName
 * @param {string} data.email
 * @param {string} data.password
 * @param {string|null} [data.phoneNumber]
 * @returns {object} Validated registration payload
 * @throws {ValidationError} If validation fails
 */
function validateRegisterInput(data) {
    const result = registerSchema.safeParse(data);
    if (!result.success) {
        throwValidationError(result.error);
    }
    return result.data;
}

/**
 * This function validates login credentials input.
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.password
 * @returns {object} Validated login payload
 * @throws {ValidationError} If validation fails
 */
function validateLoginInput(data) {
    const result = loginSchema.safeParse(data);
    if (!result.success) {
        throwValidationError(result.error);
    }
    return result.data;
}

/**
 * This function validates a refresh token string from the request body or cookie.
 * @param {string} refreshToken
 * @returns {string} Validated refresh token
 * @throws {ValidationError} If validation fails
 */
function validateRefreshTokenInput(refreshToken) {
    const result = refreshTokenSchema.safeParse(refreshToken);
    if (!result.success) {
        throwValidationError(result.error);
    }
    return result.data;
}

/**
 * This function extracts and validates a Bearer access token from the Authorization header.
 * @param {string|undefined} authorizationHeader Value of the Authorization header
 * @returns {string} Raw JWT access token expected in the Authorization header
 * @throws {ValidationError} If the header is missing or malformed
 */
function validateBearerToken(authorizationHeader) {
    const result = bearerTokenSchema.safeParse(authorizationHeader);
    if (!result.success) {
        throwValidationError(result.error);
    }
    return result.data;
}

/**
 * This function validates per-device logout context derived from the authenticated request.
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.sid Session id from the access token claims
 * @returns {object} Validated logout payload
 * @throws {ValidationError} If validation fails
 */
function validateLogoutContext({ userId, sid }) {
    const result = logoutSchema.safeParse({ userId, sid });
    if (!result.success) {
        throwValidationError(result.error);
    }
    return result.data;
}

/**
 * This function validates global logout context derived from the authenticated request.
 * @param {object} data
 * @param {number} data.userId
 * @returns {object} Validated global logout payload
 * @throws {ValidationError} If validation fails
 */
function validateLogoutAllContext({ userId }) {
    const result = logoutAllSchema.safeParse({ userId });
    if (!result.success) {
        throwValidationError(result.error);
    }
    return result.data;
}

/**
 * This function validates list-user-sessions context from the authenticated request.
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.currentSessionId Session id from the access token claims
 * @returns {object} Validated payload
 * @throws {ValidationError} If validation fails
 */
function validateListUserSessionsContext({ userId, currentSessionId }) {
    const result = listUserSessionsSchema.safeParse({
        userId,
        currentSessionId,
    });
    if (!result.success) {
        throwValidationError(result.error);
    }
    return result.data;
}

/**
 * This function validates role-based authorization arguments.
 * @param {string} userRole Role from req.user (i.e. "customer", "admin")
 * @param {...string} allowedRoles Roles permitted for the route
 * @returns {void}
 * @throws {ValidationError} If allowedRoles is empty or userRole is missing
 */
function validateAuthorizationContext(userRole, ...allowedRoles) {
    if (typeof userRole !== "string" || userRole.length === 0) {
        throw new ValidationError("Missing user role for authorization");
    }

    if (allowedRoles.length === 0) {
        throw new ValidationError(
            "No allowed roles specified for authorization",
        );
    }

    try {
        allowedRolesSchema.parse(userRole);
    } catch (error) {
        throwValidationError(error);
    }

    for (const role of allowedRoles) {
        try {
            allowedRolesSchema.parse(role);
        } catch (error) {
            throwValidationError(error);
        }
    }
}

export {
    validateRegisterInput,
    validateLoginInput,
    validateRefreshTokenInput,
    validateBearerToken,
    validateLogoutContext,
    validateLogoutAllContext,
    validateListUserSessionsContext,
    validateAuthorizationContext,
};
