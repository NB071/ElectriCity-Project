import { ValidationError } from "../../utils/errors.js";
import { DEFAULTS } from "./constants.js";
import BaseDAO from "../../utils/BaseDAO.js";

/**
 * This class is used to interact with the cart database.
 */
class CartDAO extends BaseDAO {
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
                return "ci.added_at DESC";
            case "added_at_asc":
                return "ci.added_at ASC";
            case "price_asc":
                return "COALESCE(cfg.total_price, cat.base_price) ASC";
            case "price_desc":
                return "COALESCE(cfg.total_price, cat.base_price) DESC";
            default:
                throw new ValidationError(`Unsupported cart sort: ${sort}`);
        }
    }

    // #########################
    // Read operations
    // #########################
    /**
     * This method finds a cart by user id.
     * @param {number} user_id
     * @returns {Promise<object|null>}
     * @throws {DatabaseError} On database failures
     */
    async findCartByUserId(user_id) {
        const [rows] = await this._query(
            `SELECT cart_id, user_id, session_token, expires_at, created_at, updated_at
             FROM carts
             WHERE user_id = ?`,
            [user_id],
            { suppressNotFound: true },
        );
        return rows[0] ?? null;
    }

    /**
     * This method counts cart items for a cart.
     * @param {number} cart_id
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countItemsByCartId(cart_id) {
        const [rows] = await this._query(
            `SELECT COUNT(*) AS total FROM cart_items WHERE cart_id = ?`,
            [cart_id],
        );
        return Number(rows[0].total);
    }

    /**
     * This method returns paginated cart items with catalog and configuration details.
     * @param {number} cart_id
     * @param {number} limit
     * @param {number} offset
     * @param {string} sort Validated sort key from VALIDATIONS.SORT_VALUES
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findItemsByCartId(cart_id, limit, offset, sort) {
        const orderBy = this.#resolveSortClause(sort);
        const safeLimit = Number(limit);
        const safeOffset = Number(offset);

        const [rows] = await this._query(
            `SELECT
                ci.cart_item_id,
                ci.cart_id,
                ci.cid,
                ci.config_id,
                ci.quantity,
                ci.added_at,
                cat.item_type,
                cat.base_price,
                cat.quantity AS stock,
                cat.is_active,
                b.name AS brand_name,
                m.name AS model_name,
                cfg.total_price AS config_total_price,
                cfg.created_at AS config_created_at
             FROM cart_items ci
             JOIN catalog_items cat ON cat.cid = ci.cid
             JOIN models m ON m.model_id = cat.model_id
             JOIN brands b ON b.brand_id = m.brand_id
             LEFT JOIN configurations cfg ON cfg.config_id = ci.config_id
             WHERE ci.cart_id = ?
             ORDER BY ${orderBy}
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            [cart_id],
            { suppressNotFound: true },
        );
        return rows;
    }

    /**
     * This method returns selected customization options for one or more configurations.
     * Joins config_options, option_values, and option_categories.
     * @param {number[]} config_ids
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findOptionsByConfigIds(config_ids) {
        if (!config_ids.length) {
            return [];
        }

        const placeholders = config_ids.map(() => "?").join(", ");
        const [rows] = await this._query(
            `SELECT
                co.config_id,
                co.option_id,
                ov.name AS option_name,
                ov.price_delta,
                oc.category_id,
                oc.name AS category_name,
                oc.select_type
             FROM config_options co
             JOIN option_values ov ON ov.option_id = co.option_id
             JOIN option_categories oc ON oc.category_id = ov.category_id
             WHERE co.config_id IN (${placeholders})
             ORDER BY oc.category_id ASC, ov.name ASC`,
            config_ids,
            { suppressNotFound: true },
        );
        return rows;
    }

    /**
     * This method finds one cart item and verifies it belongs to the user's cart.
     * @param {number} user_id
     * @param {number} cart_item_id
     * @returns {Promise<object|null>}
     * @throws {DatabaseError} On database failures
     */
    async findItemByUserAndId(user_id, cart_item_id) {
        const [rows] = await this._query(
            `SELECT
                ci.cart_item_id,
                ci.cart_id,
                ci.cid,
                ci.config_id,
                ci.quantity,
                ci.added_at,
                cat.item_type,
                cat.base_price,
                cat.quantity AS stock,
                cat.is_active,
                b.name AS brand_name,
                m.name AS model_name,
                cfg.total_price AS config_total_price,
                cfg.created_at AS config_created_at
             FROM cart_items ci
             JOIN carts c ON c.cart_id = ci.cart_id
             JOIN catalog_items cat ON cat.cid = ci.cid
             JOIN models m ON m.model_id = cat.model_id
             JOIN brands b ON b.brand_id = m.brand_id
             LEFT JOIN configurations cfg ON cfg.config_id = ci.config_id
             WHERE c.user_id = ? AND ci.cart_item_id = ?`,
            [user_id, cart_item_id],
            { suppressNotFound: true },
        );
        return rows[0] ?? null;
    }

    /**
     * This method finds an existing cart item for a given cart, catalog item, and
     * configuration, so addToCart can merge quantities instead of duplicating rows.
     * @param {number} cart_id
     * @param {number} cid
     * @param {number|null} config_id
     * @returns {Promise<object|null>}
     * @throws {DatabaseError} On database failures
     */
    async findItemByCartCidConfig(cart_id, cid, config_id) {
        const sql =
            config_id == null
                ? `SELECT cart_item_id, quantity FROM cart_items
                   WHERE cart_id = ? AND cid = ? AND config_id IS NULL`
                : `SELECT cart_item_id, quantity FROM cart_items
                   WHERE cart_id = ? AND cid = ? AND config_id = ?`;
        const params =
            config_id == null ? [cart_id, cid] : [cart_id, cid, config_id];

        const [rows] = await this._query(sql, params, {
            suppressNotFound: true,
        });
        return rows[0] ?? null;
    }

    // #########################
    // Write operations
    // #########################
    /**
     * This method creates a cart for a user.
     * @param {number} user_id
     * @returns {Promise<number>} The inserted cart_id
     * @throws {DatabaseError} On database failures
     */
    async insertCart(user_id) {
        const [result] = await this._query(
            `INSERT INTO carts (user_id) VALUES (?)`,
            [user_id],
        );
        return result.insertId;
    }

    /**
     * This method inserts a cart item.
     * @param {object} item
     * @param {number} item.cart_id
     * @param {number} item.cid
     * @param {number|null} [item.config_id]
     * @param {number} item.quantity
     * @returns {Promise<number>} The inserted cart_item_id
     * @throws {DatabaseError} On database failures
     */
    async insertCartItem({ cart_id, cid, config_id = null, quantity }) {
        const [result] = await this._query(
            `INSERT INTO cart_items (cart_id, cid, config_id, quantity)
             VALUES (?, ?, ?, ?)`,
            [cart_id, cid, config_id, quantity],
        );
        return result.insertId;
    }

    /**
     * This method updates a cart item quantity.
     * @param {number} cart_item_id
     * @param {number} quantity
     * @returns {Promise<void>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the cart item is not found
     */
    async updateItemQuantity(cart_item_id, quantity) {
        await this._query(
            `UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?`,
            [quantity, cart_item_id],
            { notFoundResource: "Cart item" },
        );
    }

    /**
     * This method removes one cart item by id.
     * @param {number} cart_item_id
     * @returns {Promise<void>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the cart item is not found
     */
    async deleteItemById(cart_item_id) {
        await this._query(
            `DELETE FROM cart_items WHERE cart_item_id = ?`,
            [cart_item_id],
            { notFoundResource: "Cart item" },
        );
    }

    /**
     * This method removes all items from a cart.
     * @param {number} cart_id
     * @returns {Promise<void>}
     * @throws {DatabaseError} On database failures
     */
    async deleteAllItemsByCartId(cart_id) {
        await this._query(`DELETE FROM cart_items WHERE cart_id = ?`, [
            cart_id,
        ]);
    }
}

const cartDAO = new CartDAO();
export default cartDAO;
