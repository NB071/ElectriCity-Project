import { toPaymentAttemptCore } from "./paymentSharedDTO.js";

/**
 * This function maps the customer payment attempt fields to a representable format.
 * @param {object} row DAO row
 * @returns {object}
 */
function toCustomerPaymentAttemptDTO(row) {
    return toPaymentAttemptCore(row);
}

export { toCustomerPaymentAttemptDTO };
