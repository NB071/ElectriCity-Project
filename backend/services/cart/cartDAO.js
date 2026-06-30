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
        // TODO:
        throw new Error("Not implemented");
    }

    /**
     * This method counts cart items for a cart.
     * @param {number} cart_id
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countItemsByCartId(cart_id) {
        // TODO:
        throw new Error("Not implemented");
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
        // TODO:
        throw new Error("Not implemented");
    }

    /**
     * This method returns selected customization options for one or more configurations.
     * Joins config_options, option_values, and option_categories.
     * @param {number[]} config_ids
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findOptionsByConfigIds(config_ids) {
        // TODO:
        throw new Error("Not implemented");
    }

    /**
     * This method finds one cart item and verifies it belongs to the user's cart.
     * @param {number} user_id
     * @param {number} cart_item_id
     * @returns {Promise<object|null>}
     * @throws {DatabaseError} On database failures
     */
    async findItemByUserAndId(user_id, cart_item_id) {
        // TODO:
        throw new Error("Not implemented");
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
        // TODO:
        throw new Error("Not implemented");
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
        // TODO:
        throw new Error("Not implemented");
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
        // TODO:
        throw new Error("Not implemented");
    }

    /**
     * This method removes one cart item by id.
     * @param {number} cart_item_id
     * @returns {Promise<void>}
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the cart item is not found
     */
    async deleteItemById(cart_item_id) {
        // TODO:
        throw new Error("Not implemented");
    }

    /**
     * This method removes all items from a cart.
     * @param {number} cart_id
     * @returns {Promise<void>}
     * @throws {DatabaseError} On database failures
     */
    async deleteAllItemsByCartId(cart_id) {
        // TODO:
        throw new Error("Not implemented");
    }
}

const cartDAO = new CartDAO();
export default cartDAO;
