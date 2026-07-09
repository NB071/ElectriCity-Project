// Payment Validation
// This file is used for validation of payment data

import { VALIDATIONS } from "./constants.js";
import { ValidationError } from "../../utils/errors.js";
import { z } from "zod";

const ALL_PAYMENT_METHODS = Object.values(VALIDATIONS.PAYMENT_METHODS);
const ALL_ATTEMPT_STATUSES = Object.values(VALIDATIONS.ATTEMPT_STATUS);

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

const applePayDetailsSchema = z.object({
    token: z.string({ required_error: "Apple Pay token is required." }),
});

const cardDetailsSchema = z.object({
    card_number: z.string({ required_error: "Card number is required." }),
    expiry_month: z.string({ required_error: "Expiry month is required." }),
    expiry_year: z.string({ required_error: "Expiry year is required." }),
    cvv: z.string({ required_error: "CVV is required." }),
    cardholder_name: z.string({
        required_error: "Cardholder name is required.",
    }),
});

// ref: https://zod.dev/api?id=preprocess#preprocess
const optionalUserIdSchema = z.preprocess(
    (value) =>
        value === undefined || value === null || value === "" ? null : value,
    z.union([
        z.coerce
            .number()
            .int("userID must be an integer.")
            .positive("userID must be a positive integer."),
        z.null(),
    ]),
);

// Schema definition(s)
const processPaymentSchema = z.object({
    user_id: optionalUserIdSchema,

    order_id: z.coerce
        .number({ required_error: "OrderID is required." })
        .int("OrderID must be an integer.")
        .positive("OrderID must be a positive integer."),

    amount: z.coerce
        .number({ required_error: "Amount is required." })
        .positive("Amount must be a positive number."),

    payment_method: z.enum(ALL_PAYMENT_METHODS, {
        error: () => ({
            message: `payment_method must be one of: ${ALL_PAYMENT_METHODS.join(", ")}`,
        }),
    }),

    payment_details: z.object({}).passthrough().optional(),
});

const paymentAttemptSchema = z.object({
    user_id: optionalUserIdSchema,

    order_id: z.coerce
        .number({ required_error: "OrderID is required." })
        .int("OrderID must be an integer.")
        .positive("OrderID must be a positive integer."),

    amount: z.coerce
        .number({ required_error: "Amount is required." })
        .positive("Amount must be a positive number."),

    payment_method: z.enum(ALL_PAYMENT_METHODS, {
        error: () => ({
            message: `payment_method must be one of: ${ALL_PAYMENT_METHODS.join(", ")}`,
        }),
    }),

    status: z.enum(ALL_ATTEMPT_STATUSES, {
        error: () => ({
            message: `status must be one of: ${ALL_ATTEMPT_STATUSES.join(", ")}`,
        }),
    }),
});

// Validators
/**
 * This function validates the input for processing a payment.
 * @param {object} paymentData The payment data to validate
 * @returns {object} The validated payment data
 * @throws {ValidationError} If the payment data is invalid
 */
function validateProcessPaymentInput(paymentData) {
    const parsed = processPaymentSchema.safeParse(paymentData);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    const { payment_method, payment_details } = parsed.data;

    if (payment_method === VALIDATIONS.PAYMENT_METHODS.APPLE_PAY) {
        const details = applePayDetailsSchema.safeParse(payment_details);

        if (!details.success) {
            throwValidationError(details.error);
        }
    } else if (
        payment_method === VALIDATIONS.PAYMENT_METHODS.DEBIT_CARD ||
        payment_method === VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD
    ) {
        const details = cardDetailsSchema.safeParse(payment_details);

        if (!details.success) {
            throwValidationError(details.error);
        }
    }

    return parsed.data;
}

/**
 * This function validates the input for recording a payment attempt.
 * @param {object} attemptData The payment attempt data to validate
 * @returns {object} The validated payment attempt data
 * @throws {ValidationError} If the payment attempt data is invalid
 */
function validatePaymentAttemptInput(attemptData) {
    const parsed = paymentAttemptSchema.safeParse(attemptData);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

/**
 * This function validates a payment attempt primary key.
 * @param {number|string} attemptId
 * @returns {number}
 * @throws {ValidationError} If the attempt id is invalid
 */
function validateAttemptId(attemptId) {
    const parsed = z.coerce
        .number({ required_error: "Attempt ID is required." })
        .int("Attempt ID must be an integer.")
        .positive("Attempt ID must be a positive integer.")
        .safeParse(attemptId);

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
    const parsed = z.coerce
        .number({ required_error: "User ID is required." })
        .int("User ID must be an integer.")
        .positive("User ID must be a positive integer.")
        .safeParse(userId);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

export {
    validateProcessPaymentInput,
    validatePaymentAttemptInput,
    validateAttemptId,
    validateUserId,
    ALL_PAYMENT_METHODS,
    ALL_ATTEMPT_STATUSES,
};
