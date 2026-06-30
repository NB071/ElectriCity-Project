// Cart Service
// CQRS - Mutations

import cartDAO from "./cartDAO.js";
import {
    validateAddToCart,
    validateUpdateCartItem,
    validateCartItemRef,
    validateUserId,
} from "./cartValidator.js";

/**
 * This function adds a catalog item to the user's cart.
 * userId must come from JWT
 * If the same cid (+ config_id) already exists, increment quantity instead of duplicating.
 * @requiredRole customer
 * @param {object} data
 * @param {number} data.userId
 * @param {number} data.cid
 * @param {number|null} [data.configId]
 * @param {number} [data.quantity]
 * @returns {Promise<object>} The created or updated cart item (same shape as viewCart items)
 * @throws {ValidationError} If validation fails
 * @throws {DatabaseError} If the insert or update fails
 * @example
 * {
 *     cart_item_id: 2,
 *     cid: 5,
 *     config_id: 42,
 *     quantity: 1,
 *     added_at: "2026-05-02T09:15:00.000Z",
 *     unit_price: 55490.00,
 *     line_total: 55490.00,
 *     catalog_item: {
 *         cid: 5,
 *         item_type: "vehicle",
 *         name: "Tesla Model 3",
 *         base_price: 52990.00,
 *         stock: 4,
 *         is_active: true,
 *         primary_image_url: "https://tbd.com/model-3.jpg",
 *     },
 *     configuration: {
 *         config_id: 42,
 *         total_price: 55490.00,
 *         created_at: "2026-05-02T09:14:30.000Z",
 *         options: [
 *             {
 *                 category_id: 1,
 *                 category_name: "Exterior Color",
 *                 select_type: "SINGLE",
 *                 option_id: 3,
 *                 name: "Pearl White",
 *                 price_delta: 1500.00,
 *             },
 *         ],
 *     },
 * }
 */
async function addToCart({ userId, cid, configId, quantity }) {
    try {
        const valid = validateAddToCart({
            userId,
            cid,
            configId,
            quantity,
        });

        // TODO:
        // resolve or create cart for valid.userId
        // insert or merge line item via cartDAO
        // return mapped cart item

        throw new Error("Not implemented");
    } catch (err) {
        console.error("[Service: Cart] addToCart failed:", err.message);
        throw err;
    }
}

/**
 * This function updates the quantity of a cart line item.
 * userId must come from JWT
 * @requiredRole customer
 * @param {object} data
 * @param {number} data.userId
 * @param {number} data.cartItemId
 * @param {number} data.quantity
 * @returns {Promise<object>} The updated cart item
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the cart item is not found or not owned by the user
 * @throws {DatabaseError} If the update fails
 */
async function updateCartItemQuantity({ userId, cartItemId, quantity }) {
    try {
        const valid = validateUpdateCartItem({
            userId,
            cartItemId,
            quantity,
        });

        // TODO:
        // verify ownership
        // update the quantity of the cart item
        // return updated item

        throw new Error("Not implemented");
    } catch (err) {
        console.error(
            "[Service: Cart] updateCartItemQuantity failed:",
            err.message,
        );
        throw err;
    }
}

/**
 * This function removes one item from the user's cart.
 * userId must come from JWT
 * @requiredRole customer
 * @param {object} data
 * @param {number} data.userId
 * @param {number} data.cartItemId
 * @returns {Promise<{ cart_item_id: number }>}
 * @throws {ValidationError} If validation fails
 * @throws {NotFoundError} If the cart item is not found or not owned by the user
 * @throws {DatabaseError} If the delete fails
 */
async function removeFromCart({ userId, cartItemId }) {
    try {
        const valid = validateCartItemRef({ userId, cartItemId });

        // TODO:
        // verify ownership
        // delete the cart item
        // return the cart item id

        throw new Error("Not implemented");
    } catch (err) {
        console.error("[Service: Cart] removeFromCart failed:", err.message);
        throw err;
    }
}

/**
 * This function removes all items from the user's cart.
 * userId must come from JWT
 * @requiredRole customer
 * @param {number|string} userId
 * @returns {Promise<void>}
 * @throws {ValidationError} If validation fails
 * @throws {DatabaseError} If the delete fails
 */
async function clearCart(userId) {
    try {
        const id = validateUserId(userId);

        // TODO:
        // resolve cart for id
        // delete all items from the cart

        throw new Error("Not implemented");
    } catch (err) {
        console.error("[Service: Cart] clearCart failed:", err.message);
        throw err;
    }
}

export { addToCart, updateCartItemQuantity, removeFromCart, clearCart };
