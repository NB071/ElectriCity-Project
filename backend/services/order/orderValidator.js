// Order Validation

import { z } from "zod";
import { ValidationError } from "../../utils/errors.js";
import { VALIDATIONS } from "./constants.js";

const ALL_PAYMENT_STATUSES = Object.values(VALIDATIONS.PAYMENT_STATUS);

/**
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

/**
 * This function validates an order primary key.
 * @param {number|string} orderId
 * @returns {number}
 * @throws {ValidationError} If the order id is invalid
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
 * This function validates an order payment_status value.
 * @param {string} paymentStatus
 * @returns {string}
 * @throws {ValidationError} If the payment status is invalid
 */
function validateOrderPaymentStatus(paymentStatus) {
    const parsed = z
        .enum(ALL_PAYMENT_STATUSES, {
            error: () => ({
                message: `payment_status must be one of: ${ALL_PAYMENT_STATUSES.join(", ")}`,
            }),
        })
        .safeParse(paymentStatus);

    if (!parsed.success) {
        throwValidationError(parsed.error);
    }

    return parsed.data;
}

export { validateOrderId, validateOrderPaymentStatus };
