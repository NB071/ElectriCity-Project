/**
 * This function maps the payment attempt core fields to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toPaymentAttemptCore(row) {
    return {
        attempt_id: row.attempt_id,
        order_id: row.order_id,
        amount: Number(row.amount),
        payment_method: row.payment_method,
        status: row.status,
        attempted_at: row.attempted_at,
    };
}

/**
 * This function maps the payment attempt fields to a representable format.
 * @param {object} row
 * @returns {{ attempt_id: number }}
 */
function toRecordPaymentAttemptDTO(row) {
    return {
        attempt_id: row.attempt_id,
    };
}

export { toPaymentAttemptCore, toRecordPaymentAttemptDTO };
