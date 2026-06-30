// Payment Validation
// This file is used for validation of payment data

import { VALIDATIONS } from "./constants.js";
import { ValidationError } from "../../utils/errors.js";

const ALL_PAYMENT_METHODS = Object.values(VALIDATIONS.PAYMENT_METHODS);
const ALL_ATTEMPT_STATUSES = Object.values(VALIDATIONS.ATTEMPT_STATUS);
const ALL_ORDER_PAYMENT_STATUSES = Object.values(
    VALIDATIONS.ORDER_PAYMENT_STATUS,
);

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

// Schema definition(s)
// TODO: Implement schema definitions
const processPaymentSchema = null;
const paymentAttemptSchema = null;

// Validators
/**
 * This function validates the input for processing a payment.
 * user_id must come from req.user.user_id, not the request body.
 * @param {object} paymentData The payment data to validate
 * @returns {object} The validated payment data
 * @throws {Error} If the payment data is invalid
 */
function validateProcessPaymentInput(paymentData) {
    // TODO: Implement
    throw new Error("Not implemented");
}

/**
 * This function validates the input for recording a payment attempt.
 * @param {object} attemptData The payment attempt data to validate
 * @returns {object} The validated payment attempt data
 * @throws {Error} If the payment attempt data is invalid
 */
function validatePaymentAttemptInput(attemptData) {
    // TODO: Implement
    throw new Error("Not implemented");
}

/**
 * This function validates a payment attempt primary key.
 * @param {number|string} attemptId
 * @returns {number}
 * @throws {Error} If the attempt id is invalid
 */
function validateAttemptId(attemptId) {
    // TODO: Implement
    throw new Error("Not implemented");
}

/**
 * This function validates an order primary key.
 * @param {number|string} orderId
 * @returns {number}
 * @throws {Error} If the order id is invalid
 */
function validateOrderId(orderId) {
    // TODO: Implement
    throw new Error("Not implemented");
}

/**
 * This function validates a user primary key.
 * user_id must come from req.user.user_id, not the request body.
 * @param {number|string} userId
 * @returns {number}
 * @throws {Error} If the user id is invalid
 */
function validateUserId(userId) {
    // TODO: Implement
    throw new Error("Not implemented");
}

export {
    validateProcessPaymentInput,
    validatePaymentAttemptInput,
    validateAttemptId,
    validateOrderId,
    validateUserId,
    ALL_PAYMENT_METHODS,
    ALL_ATTEMPT_STATUSES,
    ALL_ORDER_PAYMENT_STATUSES,
};
