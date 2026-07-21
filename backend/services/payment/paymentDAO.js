import BaseDAO from "../../utils/BaseDAO.js";

const USER_JOIN = `LEFT JOIN users u ON u.user_id = pa.user_id`;

/**
 * This class is used to interact with the database.
 * @touches_tables: payment_attempts, users
 * @class
 * @extends BaseDAO
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
    const [rows] = await this._query(
      `SELECT
                attempt_id,
                order_id,
                user_id,
                amount,
                payment_method,
                status,
                attempted_at
             FROM payment_attempts
             WHERE attempt_id = ?`,
      [attempt_id],
      { notFoundResource: "Payment attempt" },
    );

    return rows[0];
  }

  /**
   * This method finds a payment attempt by id with author fields for admin views.
   * @param {number} attempt_id
   * @returns {Promise<object>}
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If the payment attempt is not found
   */
  async findAttemptByIdWithUser(attempt_id) {
    const [rows] = await this._query(
      `SELECT
                pa.attempt_id,
                pa.order_id,
                pa.user_id,
                pa.amount,
                pa.payment_method,
                pa.status,
                pa.attempted_at,
                u.first_name,
                u.last_name,
                u.email
             FROM payment_attempts pa
             ${USER_JOIN}
             WHERE pa.attempt_id = ?`,
      [attempt_id],
      { notFoundResource: "Payment attempt" },
    );

    return rows[0];
  }

  /**
   * This method finds all payment attempts for an order.
   * @param {number} order_id
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findAttemptsByOrderId(order_id) {
    const [rows] = await this._query(
      `SELECT
                pa.attempt_id,
                pa.order_id,
                pa.user_id,
                pa.amount,
                pa.payment_method,
                pa.status,
                pa.attempted_at,
                u.first_name,
                u.last_name,
                u.email
             FROM payment_attempts pa
             ${USER_JOIN}
             WHERE pa.order_id = ?
             ORDER BY pa.attempted_at DESC`,
      [order_id],
      { suppressNotFound: true },
    );

    return rows;
  }

  /**
   * This method counts payment attempts for a user and payment method.
   * @param {number} user_id
   * @param {string} payment_method
   * @returns {Promise<number>}
   * @throws {DatabaseError} On database failures
   */
  async countAttemptsByUserAndMethod(user_id, payment_method) {
    const [rows] = await this._query(
      `SELECT COUNT(*) AS total
             FROM payment_attempts
             WHERE user_id = ? AND payment_method = ?`,
      [user_id, payment_method],
    );

    return Number(rows[0].total);
  }

  /**
   * This method counts payment attempts for an order and payment method.
   * Used for guest checkout mock gateway logic.
   * @param {number} order_id
   * @param {string} payment_method
   * @returns {Promise<number>}
   * @throws {DatabaseError} On database failures
   */
  async countAttemptsByOrderAndMethod(order_id, payment_method) {
    const [rows] = await this._query(
      `SELECT COUNT(*) AS total
             FROM payment_attempts
             WHERE order_id = ? AND payment_method = ?`,
      [order_id, payment_method],
    );

    return Number(rows[0].total);
  }

  /**
   * This method counts all payment attempts.
   * @returns {Promise<number>}
   * @throws {DatabaseError} On database failures
   */
  async countAllAttempts() {
    const [rows] = await this._query(
      `SELECT COUNT(*) AS total FROM payment_attempts`,
    );

    return Number(rows[0].total);
  }

  /**
   * This method finds paginated payment attempts across all users.
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findAllAttempts(limit, offset) {
    const safeLimit = Number(limit);
    const safeOffset = Number(offset);

    const [rows] = await this._query(
      `SELECT
                pa.attempt_id,
                pa.order_id,
                pa.user_id,
                pa.amount,
                pa.payment_method,
                pa.status,
                pa.attempted_at,
                u.first_name,
                u.last_name,
                u.email
             FROM payment_attempts pa
             ${USER_JOIN}
             ORDER BY pa.attempted_at DESC
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [],
      { suppressNotFound: true },
    );

    return rows;
  }

  /**
   * This method counts payment attempts for a user.
   * @param {number} user_id
   * @returns {Promise<number>}
   * @throws {DatabaseError} On database failures
   */
  async countAttemptsByUserId(user_id) {
    const [rows] = await this._query(
      `SELECT COUNT(*) AS total
             FROM payment_attempts
             WHERE user_id = ?`,
      [user_id],
    );

    return Number(rows[0].total);
  }

  /**
   * This method finds paginated payment attempts for a user.
   * @param {number} user_id
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findAttemptsByUserId(user_id, limit, offset) {
    const safeLimit = Number(limit);
    const safeOffset = Number(offset);

    const [rows] = await this._query(
      `SELECT
                attempt_id,
                order_id,
                user_id,
                amount,
                payment_method,
                status,
                attempted_at
             FROM payment_attempts
             WHERE user_id = ?
             ORDER BY attempted_at DESC
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [user_id],
      { suppressNotFound: true },
    );

    return rows;
  }

  // #########################
  // Write operations
  // #########################

  /**
   * This method inserts a payment attempt record.
   * @param {object} attempt
   * @param {number} attempt.order_id
   * @param {number|null} [attempt.user_id]
   * @param {number} attempt.amount
   * @param {string} attempt.payment_method
   * @param {string} attempt.status
   * @returns {Promise<{ attempt_id: number }>}
   * @throws {DatabaseError} On database failures
   */
  async insertPaymentAttempt({
    order_id,
    user_id,
    amount,
    payment_method,
    status,
  }) {
    const [result] = await this._query(
      `INSERT INTO payment_attempts
                (order_id, user_id, amount, payment_method, status)
             VALUES (?, ?, ?, ?, ?)`,
      [order_id, user_id, amount, payment_method, status],
    );

    return { attempt_id: result.insertId };
  }
}

const paymentDAO = new PaymentDAO();
export default paymentDAO;
