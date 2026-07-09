import BaseDAO from "../../utils/BaseDAO.js";

/**
 * This class is used to interact with the orders database.
 */
class OrderDAO extends BaseDAO {
    // #########################
    // Read operations
    // #########################

    /**
     * This method checks whether an order exists.
     * @param {number} order_id
     * @returns {Promise<boolean>}
     * @throws {DatabaseError} On database failures
     */
    async existsById(order_id) {
        const [rows] = await this._query(
            `SELECT 1 FROM orders WHERE order_id = ? LIMIT 1`,
            [order_id],
            { suppressNotFound: true },
        );

        return rows.length > 0;
    }

    /**
     * This method finds an order by its order ID.
     * @param {number} order_id
     * @returns {Promise<object>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the order is not found
     */
    async findById(order_id) {
        const [rows] = await this._query(
            `SELECT
                order_id,
                user_id,
                guest_email,
                order_status,
                payment_status,
                subtotal,
                tax,
                total,
                created_at,
                updated_at
             FROM orders
             WHERE order_id = ?`,
            [order_id],
            { notFoundResource: "Order" },
        );

        return rows[0];
    }

    // #########################
    // Write operations
    // #########################

    /**
     * This method updates the payment_status on an order.
     * @param {number} order_id
     * @param {string} payment_status
     * @returns {Promise<void>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the order is not found
     */
    async updatePaymentStatus(order_id, payment_status) {
        await this._query(
            `UPDATE orders SET payment_status = ? WHERE order_id = ?`,
            [payment_status, order_id],
            { notFoundResource: "Order" },
        );
    }
}

const orderDAO = new OrderDAO();
export default orderDAO;
