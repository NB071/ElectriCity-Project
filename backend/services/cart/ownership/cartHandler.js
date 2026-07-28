// Cart Handler
// Design Pattern / Technique: GoF Template Method / Object-Oriented Programming (OOP)

import { assertConfigBelongsToCatalog } from "../helpers/assertConfigBelongsToCatalog.js";
import { loadMappedItem } from "../helpers/loadMappedItem.js";
import { toCartItemDTO } from "../DTOs/cartItemDTO.js";
import {
    toCartSummaryDTO,
    toCartSummaryPreviewItemDTO,
} from "../DTOs/cartSummaryDTO.js";
import { getPromotionsForItems } from "../../catalog/_promotions/promotionsQuery.js";
import { NotFoundError, InternalError } from "../../../utils/errors.js";
import { VALIDATIONS } from "../constants.js";
import { paginationMeta } from "../../../utils/pagination.js";

/**
 * Template-method handler for cart operations shared by customer and guest owners.
 * Subclasses override ownership hooks (_ensureCart, _ownerMeta).
 * @class
 * @abstract
 * @see {@link https://refactoring.guru/design-patterns/template-method}
 */
class CartHandler {
    /**
     * @param {object} options
     * @param {import("../cartDAO.js").default} options.cartDAO
     */
    constructor({ cartDAO }) {
        this.cartDAO = cartDAO;
    }

    /**
     * Template: add / merge a catalog line into the owner's cart.
     * @param {object} owner
     * @param {object} line
     * @param {number} line.cid
     * @param {number|null} [line.configId]
     * @param {number} line.quantity
     * @returns {Promise<object>}
     */
    async addItem(owner, { cid, configId = null, quantity }) {
        // Ensure the cart exists for the owner
        const cart = await this._ensureCart(owner);
        const configId_ = configId ?? null;

        await assertConfigBelongsToCatalog(cid, configId_);

        const cartItemId = await this.cartDAO.upsertCartItemIncrement({
            cart_id: cart.cart_id,
            cid,
            config_id: configId_,
            quantity,
            maxQuantity: VALIDATIONS.QUANTITY.MAX,
        });

        // Load the mapped item
        const item = await loadMappedItem(cart.cart_id, cartItemId);

        // Return the mapped item and the owner metadata
        return { ...item, ...this._ownerMeta(cart) };
    }

    /**
     * Template: paginated cart view for the owner.
     * @param {object} owner The owner of the cart
     * @param {object} opts The options for the cart view
     * @param {string} opts.sort The sort order for the cart view
     * @param {{ page: number, limit: number, offset: number }} opts.pagination The pagination for the cart view
     * @returns {Promise<object>} The cart view
     */
    async viewCart(owner, { sort, pagination }) {
        // Ensure the cart exists for the owner
        const cart = await this._ensureCart(owner);

        // Count the total number of items in the cart
        const total = await this.cartDAO.countItemsByCartId(cart.cart_id);

        // Find the items in the cart
        const rows = await this.cartDAO.findItemsByCartId(
            cart.cart_id,
            pagination.limit,
            pagination.offset,
            sort,
        );

        // Find the options for the items
        const configIds = [
            ...new Set(
                rows
                    .filter((row) => row.config_id != null)
                    .map((row) => row.config_id),
            ),
        ];

        // Find the options for the items
        const allOptions = configIds.length
            ? await this.cartDAO.findOptionsByConfigIds(configIds)
            : [];

        // Batch-load promotions
        const promotionsByCid = await getPromotionsForItems(
            rows.map((row) => row.cid),
        );

        // Map the items to the cart item DTO
        const items = rows.map((row) =>
            toCartItemDTO(
                row,
                row.config_id != null
                    ? allOptions.filter(
                          (option) => option.config_id === row.config_id,
                      )
                    : [],
                promotionsByCid.get(row.cid) ?? [],
            ),
        );

        return {
            cart_id: cart.cart_id,
            items,
            pagination: paginationMeta({ ...pagination, total }),
            sort,
            ...this._ownerMeta(cart),
        };
    }

    /**
     * Template: lite cart summary for the shop header (counts + preview lines).
     * @param {object} owner The owner of the cart
     * @param {object} opts
     * @param {number} opts.previewLimit Max preview lines to return
     * @returns {Promise<object>} The cart summary
     */
    async viewCartSummary(owner, { previewLimit }) {
        const cart = await this._ensureCart(owner);
        const aggregates = await this.cartDAO.summarizeCartById(cart.cart_id);
        const rows =
            aggregates.item_count === 0
                ? []
                : await this.cartDAO.findSummaryPreviewByCartId(
                      cart.cart_id,
                      previewLimit,
                  );

        return toCartSummaryDTO({
            cartId: cart.cart_id,
            aggregates,
            preview: rows.map(toCartSummaryPreviewItemDTO),
            previewLimit,
            ownerMeta: this._ownerMeta(cart),
        });
    }

    /**
     * Template: update a line quantity.
     * @param {object} owner The owner of the cart
     * @param {object} input The input for the update item quantity
     * @param {number} input.cartItemId The cart item id
     * @param {number} input.quantity The quantity to update
     * @returns {Promise<object>} The updated item
     */
    async updateItemQuantity(owner, { cartItemId, quantity }) {
        // Ensure the cart exists for the owner
        const cart = await this._ensureCart(owner);

        // Find the item in the cart
        const item = await this.cartDAO.findItemByCartAndId(
            cart.cart_id,
            cartItemId,
        );

        // Check if the item exists
        if (!item) {
            throw new NotFoundError("Cart item");
        }

        // Update the item quantity
        await this.cartDAO.updateItemQuantity(
            cart.cart_id,
            cartItemId,
            quantity,
        );

        const mapped = await loadMappedItem(cart.cart_id, cartItemId);

        // Return the mapped item and the owner metadata
        return { ...mapped, ...this._ownerMeta(cart) };
    }

    /**
     * Template: remove one line.
     * @param {object} owner The owner of the cart
     * @param {object} input The input for the remove item
     * @param {number} input.cartItemId The cart item id
     * @returns {Promise<object>} The removed item
     */
    async removeItem(owner, { cartItemId }) {
        // Ensure the cart exists for the owner
        const cart = await this._ensureCart(owner);

        // Find the item in the cart
        const item = await this.cartDAO.findItemByCartAndId(
            cart.cart_id,
            cartItemId,
        );

        // Check if the item exists
        if (!item) {
            throw new NotFoundError("Cart item");
        }

        // Delete the item from the cart
        await this.cartDAO.deleteItemById(cartItemId);

        // Return the removed item and the owner metadata
        return {
            cart_item_id: cartItemId,
            cid: item.cid,
            ...this._ownerMeta(cart),
        };
    }

    /**
     * Template: clear all lines.
     * @param {object} owner The owner of the cart
     * @returns {Promise<object>} The cleared cart
     */
    async clearCart(owner) {
        // Ensure the cart exists for the owner
        const cart = await this._ensureCart(owner);

        // Delete all items from the cart
        await this.cartDAO.deleteAllItemsByCartId(cart.cart_id);

        // Return the owner metadata
        return this._ownerMeta(cart);
    }

    /**
     * Ensure / create the cart for this owner kind.
     * @abstract
     * @protected
     * @param {object} _owner The owner of the cart
     * @returns {Promise<{ cart_id: number, session_token: string|null, is_guest: boolean }>}
     */
    async _ensureCart(_owner) {
        throw new InternalError("_ensureCart not implemented");
    }

    /**
     * Owner metadata attached to responses.
     * @protected
     * @param {object} _cart
     * @returns {{ session_token: string|null, is_guest: boolean }}
     */
    _ownerMeta(_cart) {
        return { session_token: null, is_guest: false };
    }
}

export default CartHandler;
