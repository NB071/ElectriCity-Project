// Custom Application Errors

/*
The purpose of this file is to create a consistent error handling approach for the application.
Services, Controllers, Middlewares, etc. should all use this file to create and throw errors.
This helps with error handling and logging in a consistent manner.
*/

/**
 * This is the base error class for all application errors.
 * @class
 * @abstract
 * @extends {Error}
 * @see {@link https://adamcoster.com/blog/javascript-custom-errors}
 */
class AppError extends Error {
    /**
     * Creates a new AppError.
     * @param {string} message The error message.
     * @param {object} options The options for the error.
     * @param {number} options.status The HTTP status code.
     * @param {string} options.code The error code.
     * @param {object} options.details The details of the error.
     */
    constructor(
        message,
        { status = 500, code = "INTERNAL_ERROR", details = null } = {},
    ) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * This is the error class for all validation errors.
 * @class
 * @extends {AppError}
 */
class ValidationError extends AppError {
    /**
     * Creates a new ValidationError.
     * @param {string} message The error message.
     * @param {object} options The options for the error.
     * @param {number} options.status The HTTP status code.
     * @param {string} options.code The error code.
     * @param {object} options.details The details of the error.
     */
    constructor(message = "Validation failed", details = null) {
        super(message, { status: 400, code: "VALIDATION_ERROR", details });
    }
}

/**
 * This is the error class for all not found errors.
 * @class
 * @extends {AppError}
 */
class NotFoundError extends AppError {
    /**
     * Creates a new NotFoundError.
     * @param {string} resource The resource that was not found.
     */
    constructor(resource = "Resource") {
        super(`${resource} not found`, { status: 404, code: "NOT_FOUND" });
    }
}

/**
 * This is the error class for all unauthorized errors.
 * @class
 * @extends {AppError}
 */
class UnauthorizedError extends AppError {
    /**
     * Creates a new UnauthorizedError.
     * @param {string} message The error message.
     * @param {object} options The options for the error.
     * @param {number} options.status The HTTP status code.
     * @param {string} options.code The error code.
     * @param {object} options.details The details of the error.
     */
    constructor(message = "Authentication required") {
        super(message, { status: 401, code: "UNAUTHORIZED" });
    }
}

/**
 * This is the error class for all forbidden errors.
 * @class
 * @extends {AppError}
 */
class ForbiddenError extends AppError {
    /**
     * Creates a new ForbiddenError.
     * @param {string} message The error message.
     * @param {object} options The options for the error.
     * @param {number} options.status The HTTP status code.
     * @param {string} options.code The error code.
     * @param {object} options.details The details of the error.
     */
    constructor(message = "Access denied") {
        super(message, { status: 403, code: "FORBIDDEN" });
    }
}

/**
 * This is the error class for all conflict errors.
 * @class
 * @extends {AppError}
 */
class ConflictError extends AppError {
    /**
     * Creates a new ConflictError.
     * @param {string} message The error message.
     * @param {object} options The options for the error.
     * @param {number} options.status The HTTP status code.
     * @param {string} options.code The error code.
     * @param {object} options.details The details of the error.
     */
    constructor(message = "Resource conflict", details = null) {
        super(message, { status: 409, code: "CONFLICT", details });
    }
}

/**
 * This is the error class for all too many requests errors.
 * @class
 * @extends {AppError}
 */
class TooManyRequestsError extends AppError {
    /**
     * Creates a new TooManyRequestsError.
     * @param {string} message The error message.
     * @param {object} [details] The details of the error.
     * @used_by middlewares/rateLimit.middleware.js
     */
    constructor(
        message = "Too many requests, please try again later",
        details = null,
    ) {
        super(message, { status: 429, code: "RATE_LIMITED", details });
    }
}

/**
 * This is the error class for all database errors.
 * @class
 * @extends {AppError}
 */
class DatabaseError extends AppError {
    /**
     * Creates a new DatabaseError.
     * @param {string} message The error message.
     * @param {object} options The options for the error.
     * @param {number} options.status The HTTP status code.
     * @param {string} options.code The error code.
     * @param {object} options.details The details of the error.
     */
    constructor(message = "Database operation failed") {
        super(message, { status: 500, code: "DATABASE_ERROR" });
    }
}

/**
 * Payment gateway / processing failures (reportable 5xx).
 * Do not put card numbers, tokens, or other PII in message/details.
 * @class
 * @extends {AppError}
 */
class PaymentError extends AppError {
    /**
     * @param {string} [message]
     * @param {object|null} [details] Safe metadata only (e.g. order_id, attempt status)
     */
    constructor(message = "Payment processing failed", details = null) {
        super(message, { status: 502, code: "PAYMENT_ERROR", details });
    }
}

/**
 * Unexpected internal failures that should always be reported to Sentry.
 * @class
 * @extends {AppError}
 */
class InternalError extends AppError {
    /**
     * @param {string} [message]
     * @param {object|null} [details]
     */
    constructor(message = "Internal server error", details = null) {
        super(message, { status: 500, code: "INTERNAL_ERROR", details });
    }
}

export {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    TooManyRequestsError,
    DatabaseError,
    PaymentError,
    InternalError,
};
