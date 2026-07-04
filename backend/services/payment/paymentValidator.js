// Payment Validation
// This file is used for validation of payment data

import { VALIDATIONS } from "./constants.js";
import { ValidationError } from "../../utils/errors.js";
import { z } from "zod";

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

const applePayDetailsSchema = z.object({
    token: z.string({ required_error: "Apple Pay token is required." }),
});

const cardDetailsSchema = z.object({
    card_number: z.string({ required_error: "Card number is required." }),
    expiry_month: z.string({ required_error: "Expiry month is required." }),
    expiry_year: z.string({ required_error: "Expiry year is required." }),
    cvv: z.string({required_error: "CVV is required." }),
    cardholder_name: z.string({required_error: "Cardholder name is required."
    }),
});

// Schema definition(s)
// TODO: Implement schema definitions
const processPaymentSchema = z.object({
    user_id: z.coerce
        .number({ required_error: "userID is required." })
        .int("userID must be an integer.")
        .positive("userID must be a positive integer."),
    
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
    user_id: z.coerce
        .number({ required_error: "userID is required." })
        .int("userID must be an integer.")
        .positive("userID must be a positive integer."),
    
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
 * user_id must come from req.user.user_id, not the request body.
 * @param {object} paymentData The payment data to validate
 * @returns {object} The validated payment data
 * @throws {Error} If the payment data is invalid
 */
function validateProcessPaymentInput(paymentData) {
    const parsed = processPaymentSchema.safeParse(paymentData);
    switch (parsed.data.payment_method) {
        case VALIDATIONS.PAYMENT_METHODS.APPLE_PAY:
            const applePayParsed = applePayDetailsSchema.safeParse(
                parsed.data.payment_details,
            );
        case VALIDATIONS.PAYMENT_METHODS.DEBIT_CARD:
            const debitCardParsed = cardDetailsSchema.safeParse(
                parsed.data.payment_details,
            );
        case VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD:
            const creditCardParsed = cardDetailsSchema.safeParse(
                parsed.data.payment_details,
            );
    }
    if (!parsed.success || (parsed.data.payment_method === VALIDATIONS.PAYMENT_METHODS.APPLE_PAY && !applePayParsed.success) 
        || (parsed.data.payment_method === VALIDATIONS.PAYMENT_METHODS.DEBIT_CARD && !debitCardParsed.success) 
        || (parsed.data.payment_method === VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD && !creditCardParsed.success)) {
        throwValidationError(parsed.error);
    }
    return parsed.data;

}

/**
 * This function validates the input for recording a payment attempt.
 * @param {object} attemptData The payment attempt data to validate
 * @returns {object} The validated payment attempt data
 * @throws {Error} If the payment attempt data is invalid
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
 * @throws {Error} If the attempt id is invalid
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
 * This function validates an order primary key.
 * @param {number|string} orderId
 * @returns {number}
 * @throws {Error} If the order id is invalid
 */
function validateOrderId(orderId) {
    const parsed = z.coerce
        .number({ required_error: "Order ID is required." })
        .int("Order ID must be an integer.")
        .positive("Order ID must be a positive integer.")
        .safeParse(orderId);
    if (!parsed.success) {
        throwValidationError(parsed.error);
    }
    return parsed.data;
}


/**
 * This function validates a user primary key.
 * user_id must come from req.user.user_id, not the request body.
 * @param {number|string} userId
 * @returns {number}
 * @throws {Error} If the user id is invalid
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
    validateOrderId,
    validateUserId,
    ALL_PAYMENT_METHODS,
    ALL_ATTEMPT_STATUSES,
    ALL_ORDER_PAYMENT_STATUSES,
};
