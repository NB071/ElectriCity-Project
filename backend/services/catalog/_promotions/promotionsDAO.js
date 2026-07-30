import BaseDAO from "../../../utils/BaseDAO.js";

/**
 * This class is used to interact with the database.
 * @touches_tables: catalog_promos, promos
 * @class
 * @extends BaseDAO
 */
class PromotionsDAO extends BaseDAO {
  /**
   * Builds a parameterized EXISTS clause for catalog browse promo filtering.
   * @param {string} namePattern LIKE pattern (e.g. "%hot deal%")
   * @returns {{ sql: string, params: unknown[] }}
   */
  buildBrowseFilterFragment(namePattern) {
    return {
      sql: `EXISTS (
                SELECT 1
                FROM catalog_promos cp
                JOIN promos p ON p.promo_id = cp.promo_id
                WHERE cp.cid = ci.cid
                  AND p.is_active = TRUE
                  AND LOWER(p.name) LIKE ?
            )`,
      params: [namePattern],
    };
  }

  /**
   * This method finds promotions linked to a catalog item.
   * @param {number} cid
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findByCatalogItemId(cid) {
    const [rows] = await this._query(
      `SELECT
                p.promo_id,
                p.name,
                p.description,
                cp.discount_amount
             FROM catalog_promos cp
             JOIN promos p ON p.promo_id = cp.promo_id
             WHERE cp.cid = ?
               AND p.is_active = TRUE
             ORDER BY p.name ASC`,
      [cid],
      { suppressNotFound: true },
    );
    return rows;
  }

  /**
   * This method finds promotions linked to multiple catalog items.
   * @param {number[]} cids
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findByCatalogItemIds(cids) {
    if (!cids.length) {
      return [];
    }

    const placeholders = cids.map(() => "?").join(", ");
    const [rows] = await this._query(
      `SELECT
                cp.cid,
                p.promo_id,
                p.name,
                p.description,
                cp.discount_amount
             FROM catalog_promos cp
             JOIN promos p ON p.promo_id = cp.promo_id
             WHERE cp.cid IN (${placeholders})
               AND p.is_active = TRUE
             ORDER BY cp.cid ASC, p.name ASC`,
      cids,
      { suppressNotFound: true },
    );
    return rows;
  }
}

const promotionsDAO = new PromotionsDAO();
export default promotionsDAO;
