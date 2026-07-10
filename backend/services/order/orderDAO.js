import BaseDAO from "../../utils/BaseDAO.js";

const USER_JOIN = `LEFT JOIN users u ON u.user_id = o.user_id`;

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

    /**
     * This method counts orders for a user.
     * @param {number} user_id
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countOrdersByUserId(user_id) {
        const [rows] = await this._query(
            `SELECT COUNT(*) AS total FROM orders WHERE user_id = ?`,
            [user_id],
        );

        return Number(rows[0].total);
    }

    /**
     * This method returns paginated orders for a user, most recent first.
     * @param {number} user_id
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findOrdersByUserId(user_id, limit, offset) {
        const safeLimit = Number(limit);
        const safeOffset = Number(offset);

        const [rows] = await this._query(
            `SELECT
                o.order_id,
                o.user_id,
                o.guest_email,
                o.order_status,
                o.payment_status,
                o.subtotal,
                o.tax,
                o.total,
                o.created_at,
                o.updated_at,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS item_count
             FROM orders o
             WHERE o.user_id = ?
             ORDER BY o.created_at DESC
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            [user_id],
            { suppressNotFound: true },
        );

        return rows;
    }

    /**
     * This method counts all orders across every user.
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countAllOrders() {
        const [rows] = await this._query(
            `SELECT COUNT(*) AS total FROM orders`,
        );

        return Number(rows[0].total);
    }

    /**
     * This method returns paginated orders across all users (admin view).
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findAllOrders(limit, offset) {
        const safeLimit = Number(limit);
        const safeOffset = Number(offset);

        const [rows] = await this._query(
            `SELECT
                o.order_id,
                o.user_id,
                o.guest_email,
                o.order_status,
                o.payment_status,
                o.subtotal,
                o.tax,
                o.total,
                o.created_at,
                o.updated_at,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS item_count,
                u.first_name,
                u.last_name,
                u.email
             FROM orders o
             ${USER_JOIN}
             ORDER BY o.created_at DESC
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            [],
            { suppressNotFound: true },
        );

        return rows;
    }

    /**
     * This method finds one order with author fields for admin views.
     * @param {number} order_id
     * @returns {Promise<object>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the order is not found
     */
    async findByIdWithUser(order_id) {
        const [rows] = await this._query(
            `SELECT
                o.order_id,
                o.user_id,
                o.guest_email,
                o.order_status,
                o.payment_status,
                o.subtotal,
                o.tax,
                o.total,
                o.created_at,
                o.updated_at,
                u.first_name,
                u.last_name,
                u.email
             FROM orders o
             ${USER_JOIN}
             WHERE o.order_id = ?`,
            [order_id],
            { notFoundResource: "Order" },
        );

        return rows[0];
    }

    /**
     * This method returns the line items for an order with catalog and configuration details.
     * @param {number} order_id
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findItemsByOrderId(order_id) {
        const [rows] = await this._query(
            `SELECT
                oi.order_item_id,
                oi.order_id,
                oi.cid,
                oi.config_id,
                oi.quantity,
                oi.unit_price,
                cat.item_type,
                cat.base_price,
                cat.is_active,
                b.name AS brand_name,
                m.name AS model_name,
                cfg.total_price AS config_total_price,
                cfg.created_at AS config_created_at
             FROM order_items oi
             JOIN catalog_items cat ON cat.cid = oi.cid
             JOIN models m ON m.model_id = cat.model_id
             JOIN brands b ON b.brand_id = m.brand_id
             LEFT JOIN configurations cfg ON cfg.config_id = oi.config_id
             WHERE oi.order_id = ?
             ORDER BY oi.order_item_id ASC`,
            [order_id],
            { suppressNotFound: true },
        );

        return rows;
    }

    /**
     * This method returns the addresses recorded for an order.
     * @param {number} order_id
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findAddressesByOrderId(order_id) {
        const [rows] = await this._query(
            `SELECT
                order_address_id,
                order_id,
                address_type,
                full_name,
                phone_number,
                street,
                city,
                province,
                country,
                postal_code,
                created_at
             FROM order_addresses
             WHERE order_id = ?`,
            [order_id],
            { suppressNotFound: true },
        );

        return rows;
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

    /**
     * This method updates the order_status on an order.
     * @param {number} order_id
     * @param {string} order_status
     * @returns {Promise<void>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the order is not found
     */
    async updateOrderStatus(order_id, order_status) {
        await this._query(
            `UPDATE orders SET order_status = ? WHERE order_id = ?`,
            [order_status, order_id],
            { notFoundResource: "Order" },
        );
    }

    /**
     * This method creates an order along with its line items and addresses in one transaction.
     * @param {object} input
     * @param {object} input.order { user_id, guest_email, subtotal, tax, total }
     * @param {object[]} input.items [{ cid, config_id, quantity, unit_price }]
     * @param {object[]} input.addresses [{ address_type, full_name, phone_number, street, city, province, country, postal_code }]
     * @returns {Promise<number>} The inserted order_id
     * @throws {DatabaseError} On database failures
     */
    async createOrderWithItems({ order, items, addresses }) {
        return this._transaction(async (conn, _queryOptions) => {
            const [orderResult] = await conn.execute(
                `INSERT INTO orders (user_id, guest_email, subtotal, tax, total)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    order.user_id ?? null,
                    order.guest_email ?? null,
                    order.subtotal,
                    order.tax,
                    order.total,
                ],
            );

            const order_id = orderResult.insertId;

            for (const item of items) {
                await conn.execute(
                    `INSERT INTO order_items (order_id, cid, config_id, quantity, unit_price)
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        order_id,
                        item.cid,
                        item.config_id ?? null,
                        item.quantity,
                        item.unit_price,
                    ],
                );
            }

            for (const address of addresses) {
                await conn.execute(
                    `INSERT INTO order_addresses
                        (order_id, address_type, full_name, phone_number, street, city, province, country, postal_code)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        order_id,
                        address.address_type,
                        address.full_name,
                        address.phone_number ?? null,
                        address.street,
                        address.city,
                        address.province,
                        address.country,
                        address.postal_code,
                    ],
                );
            }

            return order_id;
        });
    }
}

const orderDAO = new OrderDAO();
export default orderDAO;
