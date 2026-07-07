// IAM Access Management
// Validation

import { VALIDATIONS, AUTH_HEADERS } from "./constants.js";
import { z } from "zod";
import { ValidationError } from "../../../utils/errors.js";

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

const refreshTokenSchema = z.string().min(1);

const bearerTokenSchema = z
    .string()
    .startsWith(AUTH_HEADERS.BEARER_PREFIX)
    .transform((header) => header.slice(AUTH_HEADERS.BEARER_PREFIX.length).trim())
    .pipe(z.string().min(1));

const logoutSchema = z.object({
    userId: z.number().int().positive(),
    jti: z.string().length(VALIDATIONS.JTI.LENGTH),
    tokenType: z.enum([
        VALIDATIONS.TOKEN_TYPES.ACCESS,
        VALIDATIONS.TOKEN_TYPES.REFRESH,
    ]),
});

/**
 * This helper parses data against a schema and throws a ValidationError on failure.
 * @param {import('zod').ZodType} schema
 * @param {unknown} data
 * @param {string} message Error message used when validation fails
 * @returns {unknown} The parsed, validated data
 * @throws {ValidationError} If validation fails
 */
function parseOrThrow(schema, data, message) {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw new ValidationError(message, result.error.issues);
    }
    return result.data;
}

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
    return parseOrThrow(registerSchema, data, "Invalid registration input");
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
    return parseOrThrow(loginSchema, data, "Invalid login credentials");
}

/**
 * This function validates a refresh token string from the request body or cookie.
 * @param {string} refreshToken
 * @returns {string} Validated refresh token
 * @throws {ValidationError} If validation fails
 */
function validateRefreshTokenInput(refreshToken) {
    return parseOrThrow(refreshTokenSchema, refreshToken, "Invalid refresh token");
}

/**
 * This function extracts and validates a Bearer access token from the Authorization header.
 * @param {string|undefined} authorizationHeader Value of the Authorization header
 * @returns {string} Raw JWT access token
 * @throws {ValidationError} If the header is missing or malformed
 */
function validateBearerToken(authorizationHeader) {
    return parseOrThrow(
        bearerTokenSchema,
        authorizationHeader,
        "Missing or malformed Authorization header",
    );
}

/**
 * This function validates logout context derived from the authenticated request and token claims.
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.jti
 * @param {string} data.tokenType One of VALIDATIONS.TOKEN_TYPES
 * @returns {object} Validated logout payload
 * @throws {ValidationError} If validation fails
 */
function validateLogoutContext({ userId, jti, tokenType }) {
    return parseOrThrow(
        logoutSchema,
        { userId, jti, tokenType },
        "Invalid logout context",
    );
}

/**
 * This function validates role-based authorization arguments.
 * @param {string} userRole Role from req.user (e.g. "customer", "admin")
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
}

export {
    validateRegisterInput,
    validateLoginInput,
    validateRefreshTokenInput,
    validateBearerToken,
    validateLogoutContext,
    validateAuthorizationContext,
};
