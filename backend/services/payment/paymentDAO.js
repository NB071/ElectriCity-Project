import BaseDAO from "../../utils/BaseDAO.js";

/**
 * This class is used to interact with the payment database.
 */
class PaymentDAO extends BaseDAO {
    // #########################
    // Read operations
    // #########################
    /**
     * This method finds a payment attempt by its attempt ID.
     * @param {number} attempt_id
     * @returns {Promise<object>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the payment attempt is not found
     */
    async findAttemptById(attempt_id) {
        // returns the list of attempts with the ID (Will only return one)
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
     * This method finds all payment attempts for an order.
     * @param {number} order_id
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the order has no payment attempts
     */
    async findAttemptsByOrderId(order_id) {
        //Returns list with all attempts for this order id, ordered chronologically, with the most recent being first
        const [rows] = await this._query(
            'SELECT * FROM payment_attempts WHERE order_id = ? ORDER BY created_at DESC',
            [order_id],
        );
        //If no attempts are returned, throw a NotFoundError
        if (rows.length === 0) {
            throw new NotFoundError(`No payment attempts found for order with ID ${order_id}.`);
        }
        return rows;
    }

    /**
     * This method counts payment attempts for a user.
     * @param {number} user_id
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countAttemptsByUserId(user_id) {
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
     * This method finds paginated payment attempts for a user.
     * @param {number} user_id
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the user has no payment attempts
     */
    async findAttemptsByUserId(user_id, limit, offset) {
        const [rows] = await this._query(
            'SELECT * FROM payment_attempts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [user_id, limit, offset],
        );
        //If no attempts are returned, throw a NotFoundError
        if (rows.length === 0) {
            throw new NotFoundError(`No payment attempts found for user with ID ${user_id}.`);
        }
        return rows;
    }

    /**
     * This method finds an order by its order ID.
     * @param {number} order_id
     * @returns {Promise<object|null>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the order is not found
     */
    async findOrderById(order_id) {
        // TODO: Implement
        throw new Error("Not implemented");
    }

    // #########################
    // Write operations
    // #########################
    /**
     * This method inserts a payment attempt record.
     * @pre user_id is validated and exists (IAM service)
     * @param {object} attempt
     * @param {number} attempt.order_id
     * @param {number} attempt.user_id
     * @param {number} attempt.amount
     * @param {string} attempt.payment_method
     * @param {string} attempt.status
     * @returns {Promise<number>} The inserted attempt_id
     * @throws {DatabaseError} On database failures
     * @throws {ConflictError} If the payment attempt already exists
     */
    async insertPaymentAttempt({
        order_id,
        user_id,
        amount,
        payment_method,
        status,
    }) {
        // TODO: Implement
        throw new Error("Not implemented");
    }

    /**
     * This method updates the payment_status on an order.
     * @param {number} order_id
     * @param {string} payment_status
     * @returns {Promise<void>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the order is not found
     */
    async updateOrderPaymentStatus(order_id, payment_status) {
        // TODO: Implement
        throw new Error("Not implemented");
    }
}

const paymentDAO = new PaymentDAO();
export default paymentDAO;
