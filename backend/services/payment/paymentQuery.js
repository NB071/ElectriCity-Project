// Payment Service
// CQRS - Query side (reads)

import { validatePaginationParams } from "../../utils/pagination";
import { validateSortParams } from "../wishlist/wishlistValidator";
import { parsePaginationQuery } from "../../utils/pagination";

/**
 * This function returns one payment attempt by attempt_id.
 * @requiredRole admin
 * @param {number|string} attempt_id
 * @returns {Promise<object>}
 * @throws {Error} If the attempt id is invalid, not found, or the query fails
 */
async function getPaymentAttemptById(attempt_id) {
    // returns the list of attempts with the ID (Will only return one because its a primary key)
    const [rows] = await this._query(
        'SELECT * FROM payment_attempts WHERE attempt_id = ?',
        [attempt_id],
    );
    //If no attempt is returned, throw a NotFoundError
    if (rows.length === 0) {
        throw new NotFoundError(`Payment attempt with ID ${attempt_id} not found.`);
    }
    return rows[0];
}

/**
 * This function returns all payment attempts for an order.
 * @requiredRole admin
 * @param {number|string} order_id
 * @returns {Promise<object[]>}
 * @throws {Error} If the order id is invalid or the query fails
 */
async function getPaymentAttemptsByOrderId(order_id) {
    //Returns list with all attempts made by the given user ID
    const [rows] = await this._query(
        'SELECT * FROM payment_attempts WHERE user_id = ? ORDER BY created_at DESC',
        [user_id],
    );
    //If no attempts are returned, throw a NotFoundError
    if (rows.length === 0) {
        throw new NotFoundError(`No payment attempts found for user with ID ${user_id}.`);
    }
    return rows.length;
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
    try{
        const validID = validateUserId(user_id);

        if(!validatePaginationParams(paginationQuery)){
            throw new ValidationError("Invalid pagination parameters.");
        }

        const { sort } = validateSortParams(queryParams);
        const pagination = parsePaginationQuery(queryParams);
        const total = await paymentDAO.countAttemptsByUserId(validID);
        const rows = await paymentDAO.findAttemptsByUserId(
            validID,
            pagination.limit,
            pagination.offset,
            sort,
        );

        return{
            items: rows.map(toPaymentAttemptDTO),
            pagination: paginationMeta({ ...pagination, total }),
            sort,
        };
    }
    catch (err) {
        console.error("[Service: Payment Query] getPaymentAttemptsByUserID failed:", err.message);
        throw err;
    }
}

export {
    getPaymentAttemptById,
    getPaymentAttemptsByOrderId,
    getPaymentAttemptsByUserId,
};
