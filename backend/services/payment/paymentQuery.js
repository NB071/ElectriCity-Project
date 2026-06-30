// Payment Service
// CQRS - Query side (reads)

/**
 * This function returns one payment attempt by attempt_id.
 * @requiredRole admin
 * @param {number|string} attempt_id
 * @returns {Promise<object>}
 * @throws {Error} If the attempt id is invalid, not found, or the query fails
 */
async function getPaymentAttemptById(attempt_id) {
    // TODO: Implement
    throw new Error("Not implemented");
}

/**
 * This function returns all payment attempts for an order.
 * @requiredRole admin
 * @param {number|string} order_id
 * @returns {Promise<object[]>}
 * @throws {Error} If the order id is invalid or the query fails
 */
async function getPaymentAttemptsByOrderId(order_id) {
    // TODO: Implement
    throw new Error("Not implemented");
}

/**
 * This function returns paginated payment attempts for a user.
 * user_id must come from req.user.user_id, not the request body.
 * @requiredRole customer
 * @param {number|string} user_id
 * @param {object} [paginationQuery] Raw query params (page, limit)
 * @returns {Promise<{ items: object[], pagination: object }>}
 * @throws {Error} If validation fails or the query fails
 */
async function getPaymentAttemptsByUserId(user_id, paginationQuery = {}) {
    // TODO: Implement
    throw new Error("Not implemented");
}

export {
    getPaymentAttemptById,
    getPaymentAttemptsByOrderId,
    getPaymentAttemptsByUserId,
};
