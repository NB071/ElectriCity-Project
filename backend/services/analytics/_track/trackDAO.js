import BaseDAO from "../../../utils/BaseDAO.js";

/**
 * This class is used to interact with the database.
 * @touches_tables: event_logs, event_type, catalog_items, models, brands, vehicles
 * @class
 */
class TrackDAO extends BaseDAO {
  // #########################
  // Read operations
  // #########################
  /**
   * This method counts the number of events by event type.
   * @param {string} start
   * @param {string} end
   * @param {number} limit
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async countByEventType(start, end, limit) {
    const safeLimit = Number(limit);
    const [rows] = await this._query(
      `SELECT et.code, et.name, COUNT(*) AS total
             FROM event_logs el
             JOIN event_type et ON et.event_type_id = el.event_type_id
             WHERE el.created_at >= ? AND el.created_at < ? + INTERVAL 1 DAY
             GROUP BY et.event_type_id, et.code, et.name
             ORDER BY total DESC
             LIMIT ${safeLimit}`,
      [start, end],
    );
    return rows;
  }

  /**
   * This method returns the top catalog items for a given event type.
   * @param {number} eventTypeId
   * @param {string} start
   * @param {string} end
   * @param {number} limit
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async topCatalogItemsByEvent(eventTypeId, start, end, limit) {
    const safeLimit = Number(limit);
    const [rows] = await this._query(
      `SELECT el.cid,
                CONCAT(b.name, ' ', m.name) AS name,
                ci.item_type,
                COUNT(*) AS total
             FROM event_logs el
             JOIN catalog_items ci ON ci.cid = el.cid
             JOIN models m         ON m.model_id = ci.model_id
             JOIN brands b         ON b.brand_id = m.brand_id
             WHERE el.event_type_id = ?
                AND el.cid IS NOT NULL
                AND el.created_at >= ? AND el.created_at < ? + INTERVAL 1 DAY
             GROUP BY el.cid, name, ci.item_type
             ORDER BY total DESC
             LIMIT ${safeLimit}`,
      [eventTypeId, start, end],
    );
    return rows;
  }

  /**
   * This method returns the daily time-series (trend) for a given event type.
   * @param {number} eventTypeId
   * @param {string} start
   * @param {string} end
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async dailyTrend(eventTypeId, start, end) {
    const [rows] = await this._query(
      `SELECT DATE(el.created_at) AS day, COUNT(*) AS total
         FROM event_logs el
         WHERE el.event_type_id = ?
           AND el.created_at >= ? AND el.created_at < ? + INTERVAL 1 DAY
         GROUP BY DATE(el.created_at)
         ORDER BY day ASC`,
      [eventTypeId, start, end],
    );
    return rows;
  }

  /**
   * This method returns the active event type IDs.
   * @returns {Promise<number[]>}
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If there's no active event type
   */
  async findActiveEventTypeIds() {
    const [rows] = await this._query(
      `SELECT event_type_id FROM event_type WHERE is_active = TRUE`,
      [],
      { notFoundResource: "Active event type" },
    );
    return rows;
  }

  /**
   * This method returns the event details by event ID.
   * @param {number} eventId
   * @returns {Promise<object>} The event details
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If the event is not found
   */
  async findEventById(eventId) {
    const [rows] = await this._query(
      `SELECT
                el.event_id,
                et.code              AS event_code,
                et.name              AS event_type_name,
                el.user_id,
                el.cid,
                el.meta,
                el.ip_address,
                el.created_at,
                ci.item_type,
                ci.base_price,
                ci.quantity,
                ci.is_active,
                b.name               AS brand_name,
                m.name               AS model_name,
                m.model_type,
                v.year               AS vehicle_year,
                v.\`condition\`      AS vehicle_condition,
                v.mileage            AS vehicle_mileage
             FROM event_logs el
             JOIN event_type et ON et.event_type_id = el.event_type_id
             LEFT JOIN catalog_items ci ON ci.cid = el.cid
             LEFT JOIN models m         ON m.model_id = ci.model_id
             LEFT JOIN brands b         ON b.brand_id = m.brand_id
             LEFT JOIN vehicles v       ON v.cid = el.cid
             WHERE el.event_id = ?`,
      [eventId],
      { notFoundResource: "Event" },
    );
    return rows[0];
  }

  // #########################
  // Write operations
  // #########################
  /**
   * This method inserts a new event log into the database.
   * @param {object} event
   * @param {number} event.event_type_id
   * @param {number} event.user_id
   * @param {number} event.cid
   * @param {object} event.meta
   * @param {string} event.ip_address
   * @returns {Promise<number>}
   * @throws {DatabaseError} On database failures
   * @throws {ConflictError} On conflict errors
   */
  async insertEvent({
    event_type_id,
    user_id = null,
    cid = null,
    meta = null,
    ip_address = null,
  }) {
    const [result] = await this._query(
      `INSERT INTO event_logs (event_type_id, user_id, cid, meta, ip_address)
             VALUES (?, ?, ?, ?, ?)`,
      [
        event_type_id,
        user_id,
        cid,
        meta ? JSON.stringify(meta) : null,
        ip_address,
      ],
      { conflictMessage: "Event already exists" },
    );
    return result.insertId;
  }

  /**
   * This method updates the active status of an event type.
   * @param {number} eventTypeId
   * @param {boolean} isActive
   * @returns {Promise<void>}
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If the event type is not found
   */
  async updateEventTypeActive(eventTypeId, isActive) {
    await this._query(
      `UPDATE event_type SET is_active = ? WHERE event_type_id = ?`,
      [isActive ? 1 : 0, eventTypeId],
      { notFoundResource: "Event type" },
    );
  }
}

const trackDAO = new TrackDAO();
export default trackDAO;
