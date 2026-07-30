import { DatabaseError, ValidationError } from "../../utils/errors.js";
import { DEFAULTS } from "./constants.js";
import BaseDAO from "../../utils/BaseDAO.js";

/**
 * This class is used to interact with the database.
 * @touches_tables: wishlist, catalog_items, models, brands, catalog_images, media
 * @class
 * @extends BaseDAO
 */
class WishlistDAO extends BaseDAO {
  /**
   * This constructor calls the constructor of the BaseDAO class.
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * This private method resolves a sort key to an 'ORDER BY' SQL clause.
   * @private
   * @param {string} sort
   * @returns {string}
   * @throws {ValidationError} If the sort key is not supported
   */
  #resolveSortClause(sort) {
    switch (sort) {
      case "added_at_desc":
        return "w.added_at DESC";
      case "added_at_asc":
        return "w.added_at ASC";
      case "price_asc":
        return "ci.base_price ASC";
      case "price_desc":
        return "ci.base_price DESC";
      case "name_asc":
        return "b.name ASC, m.name ASC";
      case "name_desc":
        return "b.name DESC, m.name DESC";
      // just in case default sort constant is not in the DEFAULTS
      default:
        throw new ValidationError(`Unsupported wishlist sort: ${sort}`);
    }
  }

  // #########################
  // Read operations
  // #########################
  /**
   * This method counts wishlist items for a user.
   * @param {number} user_id
   * @returns {Promise<number>}
   * @throws {DatabaseError} On database failures
   */
  async countByUserId(user_id) {
    const [rows] = await this._query(
      `SELECT COUNT(*) AS total FROM wishlist WHERE user_id = ?`,
      [user_id],
    );
    return rows[0].total;
  }

  /**
   * This method returns paginated wishlist items for a user with catalog details.
   * @param {number} user_id
   * @param {number} limit
   * @param {number} offset
   * @param {string} sort Validated sort key from VALIDATIONS.SORT_VALUES
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If the user has no wishlist items
   */
  async findByUserId(user_id, limit, offset, sort = DEFAULTS.SORT) {
    const safeLimit = Number(limit);
    const safeOffset = Number(offset);
    const [rows] = await this._query(
      `SELECT
                w.user_id,
                w.cid,
                w.added_at,
                ci.item_type,
                ci.base_price,
                ci.quantity,
                ci.is_active,
                b.name AS brand_name,
                m.name AS model_name,
                pm.url AS primary_image_url
             FROM wishlist w
             JOIN catalog_items ci ON ci.cid = w.cid
             JOIN models m         ON m.model_id = ci.model_id
             JOIN brands b         ON b.brand_id = m.brand_id
             LEFT JOIN catalog_images ci_img
                ON ci_img.cid = w.cid AND ci_img.is_primary = TRUE
             LEFT JOIN media pm ON pm.media_id = ci_img.media_id
             WHERE w.user_id = ?
             ORDER BY ${this.#resolveSortClause(sort)}
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [user_id],
      { notFoundResource: "Wishlist items for user" },
    );
    return rows;
  }

  /**
   * This method returns all catalog item ids in a user's wishlist.
   * Empty wishlists return an empty array (no NotFoundError).
   * @param {number} user_id
   * @returns {Promise<{ cid: number }[]>}
   * @throws {DatabaseError} On database failures
   */
  async findCidsByUserId(user_id) {
    const [rows] = await this._query(
      `SELECT cid
             FROM wishlist
             WHERE user_id = ?
             ORDER BY added_at DESC`,
      [user_id],
      { suppressNotFound: true },
    );
    return rows;
  }

  /**
   * This method finds one wishlist entry for a user and catalog item.
   * @param {number} user_id
   * @param {number} cid
   * @returns {Promise<{ user_id: number, cid: number, added_at: string }>}
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If the user has no wishlist items or the item is not in the wishlist
   */
  async findEntry(user_id, cid) {
    const [rows] = await this._query(
      `SELECT user_id, cid, added_at
             FROM wishlist
             WHERE user_id = ? AND cid = ?`,
      [user_id, cid],
      {
        notFoundResource: "Wishlist item for user and catalog item",
      },
    );
    return rows[0];
  }

  // #########################
  // Write operations
  // #########################
  /**
   * This method adds a catalog item to a user's wishlist.
   * PRIMARY KEY (user_id, cid).
   * @param {object} entry
   * @param {number} entry.user_id
   * @param {number} entry.cid
   * @returns {Promise<object>} The wishlist entry
   * @throws {ConflictError} If the item is already in the wishlist
   * @throws {DatabaseError} If the insert fails
   */
  async insert({ user_id, cid }) {
    await this._query(
      `INSERT INTO wishlist (user_id, cid) VALUES (?, ?)`,
      [user_id, cid],
      {
        conflictMessage: "Catalog item is already in the wishlist.",
        conflictDetails: { user_id, cid },
      },
    );

    const entry = await this.findEntry(user_id, cid);

    if (!entry) {
      throw new DatabaseError(
        "Wishlist entry was inserted but could not be retrieved.",
      );
    }

    return entry;
  }

  /**
   * This method removes a catalog item from a user's wishlist.
   * @param {number} user_id
   * @param {number} cid
   * @returns {Promise<void>}
   * @throws {NotFoundError} If the item is not in the wishlist
   * @throws {DatabaseError} On database failures
   */
  async deleteByUserAndCid(user_id, cid) {
    await this._query(
      `DELETE FROM wishlist WHERE user_id = ? AND cid = ?`,
      [user_id, cid],
      { notFoundResource: "Wishlist item" },
    );
  }
}

const wishlistDAO = new WishlistDAO();
export default wishlistDAO;
