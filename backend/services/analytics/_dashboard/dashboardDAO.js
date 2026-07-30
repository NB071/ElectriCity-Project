import BaseDAO from "../../../utils/BaseDAO.js";

/**
 * Dashboard DAO layer for aggregated business metrics.
 * @touches_tables:
 */
class DashboardDAO extends BaseDAO {
  /**
   * This method returns high-level admin dashboard KPIs
   * @returns {Promise<object>}
   * @throws {DatabaseError} On database failures
   */
  async getAdminKPIs() {
    const [revenueRows] = await this._query(
      `SELECT SUM(total) AS totalRevenue 
       FROM orders 
       WHERE order_status != 'cancelled' AND payment_status = 'paid'`,
      [],
    );

    const [orderRows] = await this._query(
      `SELECT COUNT(order_id) AS totalOrders
       FROM orders`,
      [],
    );

    const [userRows] = await this._query(
      `SELECT COUNT(user_id) AS totalUsers
       FROM users`,
      [],
    );

    const [avgOrderRows] = await this._query(
      `SELECT AVG(total) AS averageOrderValue 
       FROM orders 
       WHERE order_status != 'cancelled' AND payment_status = 'paid'`,
      [],
    );

    return {
      totalRevenue: Number(revenueRows[0]?.totalRevenue) || 0,
      totalOrders: Number(orderRows[0]?.totalOrders) || 0,
      totalUsers: Number(userRows[0]?.totalUsers) || 0,
      averageOrderValue: Number(avgOrderRows[0]?.averageOrderValue) || 0,
    };
  }

  /**
   * This method returns a breakdown of orders by status.
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async getOrdersByStatus() {
    const [rows] = await this._query(
      `SELECT order_status AS status, COUNT(order_id) as count
       FROM orders
       GROUP BY order_status`,
      [],
      { suppressNotFound: true },
    );
    return rows;
  }

  /**
   * This method returns the revenue trend for the last 30 days.
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async getRevenueTrend() {
    const [rows] = await this._query(
      `SELECT DATE(created_at) AS date, SUM(total) AS revenue
       FROM orders
       WHERE order_status != 'cancelled' AND payment_status = 'paid'
         AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [],
      { suppressNotFound: true },
    );
    return rows;
  }

  /**
   * This method returns recent orders across all users
   * @param {number} limit
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async getRecentOrders(limit = 5) {
    const safeLimit = Number(limit);
    const [rows] = await this._query(
      `SELECT
            o.order_id,
            o.total,
            o.order_status,
            o.created_at,
            u.first_name,
            u.last_name
         FROM orders o
         LEFT JOIN users u ON u.user_id = o.user_id
         ORDER BY o.created_at DESC
         LIMIT ${safeLimit}`,
      [],
      { suppressNotFound: true },
    );
    return rows;
  }

  // --- Customer Dashboards ---

  /**
   * Returns KPIs for a specific customer
   * @param {number|string} userId
   * @returns {Promise<object>}
   * @throws {DatabaseError} On database failures
   */
  async getCustomerKPIs(userId) {
    const [spentRows] = await this._query(
      `SELECT SUM(total) AS totalAmountSpent
       FROM orders
       WHERE user_id = ? AND order_status != 'cancelled' AND payment_status = 'paid'`,
      [userId],
    );

    const [accountRows] = await this._query(
      `SELECT (deleted_at IS NULL) AS is_active, created_at 
       FROM users 
       WHERE user_id = ?`,
      [userId],
      { notFoundResource: "User account" },
    );

    const [orderCountRows] = await this._query(
      `SELECT 
        COUNT(order_id) AS totalOrders,
        SUM(CASE WHEN order_status IN ('confirmed', 'pending', 'shipped') THEN 1 ELSE 0 END) AS activeOrders,
        SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) AS completedOrders
       FROM orders
       WHERE user_id = ?`,
      [userId],
    );

    const [wishlistRows] = await this._query(
      `SELECT COUNT(cid) AS itemCount
       FROM wishlist
       WHERE user_id = ?`,
      [userId],
    );

    return {
      totalAmountSpent: Number(spentRows[0]?.totalAmountSpent) || 0,
      accountStatus: accountRows[0]?.is_active ? "active" : "inactive",
      memberSince: accountRows[0]?.created_at || null,
      totalOrders: Number(orderCountRows[0]?.totalOrders) || 0,
      activeOrders: Number(orderCountRows[0]?.activeOrders) || 0,
      completedOrders: Number(orderCountRows[0]?.completedOrders) || 0,
      wishlistItemCount: Number(wishlistRows[0]?.itemCount) || 0,
    };
  }

  /**
   * Returns recent orders for a specific customer
   * @param {number|string} userId
   * @param {number} limit
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async getRecentOrdersByUser(userId, limit = 5) {
    const safeLimit = Number(limit);
    const [rows] = await this._query(
      `SELECT
            o.order_id,
            o.total,
            o.order_status,
            o.created_at,
            (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS itemCount
         FROM orders o
         WHERE o.user_id = ?
         ORDER BY o.created_at DESC
         LIMIT ${safeLimit}`,
      [userId],
      { suppressNotFound: true },
    );
    return rows;
  }
}

const dashboardDAO = new DashboardDAO();
export default dashboardDAO;
