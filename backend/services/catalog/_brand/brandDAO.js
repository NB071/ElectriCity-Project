import BaseDAO from "../../../utils/BaseDAO.js";

/**
 * This class is the DAO for accessing database.
 * @touches_tables: brands, media
 * @class
 * @extends BaseDAO
 */
class BrandDAO extends BaseDAO {
  /**
   * Shared SELECT list for brand rows (logo resolved via media LEFT JOIN).
   * @private
   */
  #brandSelect = `
        b.brand_id,
        b.name,
        b.description,
        b.country,
        b.website_url,
        b.media_id,
        b.is_featured,
        b.display_order,
        b.created_at,
        b.updated_at,
        m.url AS logo_url,
        m.file_type AS logo_file_type,
        m.alt_text AS logo_alt_text
    `;

  /**
   * Shared FROM/JOIN clause for brand + optional logo media.
   * @private
   */
  #brandFrom = `
        FROM brands b
        LEFT JOIN media m ON m.media_id = b.media_id
    `;

  /**
   * This method counts brands, optionally restricted to featured ones.
   * @param {object} [filters]
   * @param {boolean} [filters.is_featured]
   * @returns {Promise<number>}
   * @throws {DatabaseError} On database failures
   */
  async countBrands(filters = {}) {
    const where = [];
    const params = [];

    if (filters.is_featured === true) {
      where.push("b.is_featured = TRUE");
    } else if (filters.is_featured === false) {
      where.push("b.is_featured = FALSE");
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const [rows] = await this._query(
      `SELECT COUNT(*) AS total
             FROM brands b
             ${whereSql}`,
      params,
      { suppressNotFound: true },
    );
    return Number(rows[0]?.total ?? 0);
  }

  /**
   * This method lists brand id/name pairs for filter UIs (no media join).
   * Ordered by name ascending.
   * @param {object} [filters]
   * @param {boolean} [filters.is_featured]
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findLiteBrands(filters = {}) {
    const where = [];
    const params = [];

    if (filters.is_featured === true) {
      where.push("b.is_featured = TRUE");
    } else if (filters.is_featured === false) {
      where.push("b.is_featured = FALSE");
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const [rows] = await this._query(
      `SELECT b.brand_id, b.name
             FROM brands b
             ${whereSql}
             ORDER BY b.name ASC`,
      params,
      { suppressNotFound: true },
    );
    return rows;
  }

  /**
   * This method lists brands with optional featured filter.
   * When `orderByDisplayOrder` is true, results are sorted by display_order
   * (nulls last), then name. Featured-only lists leave order unspecified.
   * @param {object} [filters]
   * @param {boolean} [filters.is_featured]
   * @param {object} [options]
   * @param {boolean} [options.orderByDisplayOrder=false]
   * @param {number} [options.limit]
   * @param {number} [options.offset]
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findBrands(filters = {}, options = {}) {
    const where = [];
    const params = [];

    if (filters.is_featured === true) {
      where.push("b.is_featured = TRUE");
    } else if (filters.is_featured === false) {
      where.push("b.is_featured = FALSE");
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const orderSql = options.orderByDisplayOrder
      ? "ORDER BY b.display_order IS NULL ASC, b.display_order ASC, b.name ASC"
      : "";

    let limitSql = "";
    if (options.limit != null) {
      const safeLimit = Number(options.limit);
      const safeOffset = Number(options.offset ?? 0);
      limitSql = `LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    }

    const [rows] = await this._query(
      `SELECT ${this.#brandSelect}
             ${this.#brandFrom}
             ${whereSql}
             ${orderSql}
             ${limitSql}`,
      params,
      { suppressNotFound: true },
    );
    return rows;
  }

  /**
   * This method finds a brand by primary key.
   * @param {number} brandId
   * @returns {Promise<object|null>}
   * @throws {NotFoundError} If the brand does not exist
   * @throws {DatabaseError} On database failures
   */
  async findById(brandId) {
    const [rows] = await this._query(
      `SELECT ${this.#brandSelect}
             ${this.#brandFrom}
             WHERE b.brand_id = ?`,
      [brandId],
      { notFoundResource: "Brand" },
    );
    return rows[0] ?? null;
  }
}

const brandDAO = new BrandDAO();
export default brandDAO;
