/**
 * This function maps the payment result fields to a representable format.
 * @param {object} result
 * @param {number} result.attempt_id
 * @param {number} result.order_id
 * @param {number} result.amount
 * @param {string} result.payment_method
 * @param {string} result.status Attempt status
 * @param {string} result.payment_status Order payment status
 * @returns {object}
 */
function toPaymentResultDTO({
    attempt_id,
    order_id,
    amount,
    payment_method,
    status,
    payment_status,
}) {
    return {
        attempt_id,
        order_id,
        amount: Number(amount),
        payment_method,
        status,
        payment_status,
    };
}

export { toPaymentResultDTO };
