// Cart Service
// CQRS - Mutations

import cartDAO from "./cartDAO.js";
import CartRegistry from "./ownership/cartRegistry.js";
import {
    validateAddToCart,
    validateUpdateCartItem,
    validateCartItemRef,
    validateCartOwner,
    validateMergeGuestCart,
    validateCartItemId,
    validateCatalogItemId,
    validateUserId,
} from "./cartValidator.js";
import { resolveCartKind } from "./helpers/resolveCartKind.js";
import { assertConfigBelongsToCatalog } from "./helpers/assertConfigBelongsToCatalog.js";
import { ValidationError } from "../../utils/errors.js";
import { VALIDATIONS } from "./constants.js";
import log from "../../utils/logger.js";

const cartRegistry = new CartRegistry({ cartDAO });

/**
 * This function adds a catalog item to the caller's cart (customer JWT or guest session).
 * @param {object} data data to add to the cart
 * @param {number|null} [data.userId] user id
 * @param {string|null} [data.sessionToken] session token
 * @param {number} data.cid catalog item id
 * @param {number|null} [data.configId] configuration id
 * @param {number} [data.quantity] quantity
 * @returns {Promise<object>} the cart item
 * @throws {ValidationError} If the cart item is not found
 * @throws {DatabaseError} If the cart item is not found
 */
async function addToCart({ userId, sessionToken, cid, configId, quantity }) {
    try {
        const valid = validateAddToCart({
            userId: userId != null ? validateUserId(userId) : null,
            sessionToken,
            cid: validateCatalogItemId(cid),
            configId,
            quantity,
        });

        const handler = cartRegistry.get(resolveCartKind(valid));
        return handler.addItem(valid, {
            cid: valid.cid,
            configId: valid.configId ?? null,
            quantity: valid.quantity,
        });
    } catch (err) {
        log.error("Cart", "addToCart", "addToCart failed", err);
        throw err;
    }
}

/**
 * This function updates the quantity of a cart line item.
 * @param {object} data data to update the cart item quantity
 * @param {number|null} [data.userId] user id
 * @param {string|null} [data.sessionToken] session token
 * @param {number} data.cartItemId cart item id
 * @param {number} data.quantity quantity
 * @returns {Promise<object>} the cart item
 * @throws {ValidationError} If the cart item is not found
 * @throws {DatabaseError} If the cart item is not found
 */
async function updateCartItemQuantity({
    userId,
    sessionToken,
    cartItemId,
    quantity,
}) {
    try {
        const valid = validateUpdateCartItem({
            userId: userId != null ? validateUserId(userId) : null,
            sessionToken,
            cartItemId: validateCartItemId(cartItemId),
            quantity,
        });

        // get the cart handler (customer or guest template method)
        const handler = cartRegistry.get(resolveCartKind(valid));

        // update the cart item quantity
        return handler.updateItemQuantity(valid, {
            cartItemId: valid.cartItemId,
            quantity: valid.quantity,
        });
    } catch (err) {
        log.error(
            "Cart",
            "updateCartItemQuantity",
            "updateCartItemQuantity failed",
            err,
        );
        throw err;
    }
}

/**
 * This function removes one item from the caller's cart.
 * @param {object} data data to remove the cart item
 * @param {number|null} [data.userId] user id
 * @param {string|null} [data.sessionToken] session token
 * @param {number} data.cartItemId cart item id
 * @returns {Promise<{ cart_item_id: number, cid: number, session_token: string|null, is_guest: boolean }>} the cart item
 * @throws {ValidationError} If the cart item is not found
 * @throws {DatabaseError} If the cart item is not found
 */
async function removeFromCart({ userId, sessionToken, cartItemId }) {
    try {
        const valid = validateCartItemRef({
            userId: userId != null ? validateUserId(userId) : null,
            sessionToken,
            cartItemId: validateCartItemId(cartItemId),
        });

        // get the cart handler (customer or guest template method)
        const handler = cartRegistry.get(resolveCartKind(valid));

        // remove the cart item
        return handler.removeItem(valid, {
            cartItemId: valid.cartItemId,
        });
    } catch (err) {
        log.error("Cart", "removeFromCart", "removeFromCart failed", err);
        throw err;
    }
}

/**
 * This function removes all items from the caller's cart.
 * @param {{ userId?: number|null, sessionToken?: string|null }|number|string} ownerOrUserId data to clear the cart
 * @param {number|null} [ownerOrUserId.userId] user id
 * @param {string|null} [ownerOrUserId.sessionToken] session token
 * @returns {Promise<{ session_token: string|null, is_guest: boolean }>}
 * @throws {ValidationError} If neither authentication nor X-Cart-Session is present
 */
async function clearCart(ownerOrUserId) {
    try {
        const owner =
            typeof ownerOrUserId === "object" && ownerOrUserId !== null
                ? validateCartOwner({
                      userId:
                          ownerOrUserId.userId != null
                              ? validateUserId(ownerOrUserId.userId)
                              : null,
                      sessionToken: ownerOrUserId.sessionToken,
                  })
                : validateCartOwner({ userId: validateUserId(ownerOrUserId) });

        // if the owner is not found, return null and false
        if (owner.userId == null && owner.sessionToken == null) {
            throw new ValidationError(
                "Either authentication or X-Cart-Session is required.",
            );
        }

        // get the cart handler (customer or guest template method)
        const handler = cartRegistry.get(resolveCartKind(owner));

        // clear the cart
        return handler.clearCart(owner);
    } catch (err) {
        log.error("Cart", "clearCart", "clearCart failed", err);
        throw err;
    }
}

/**
 * This function merges a guest cart into the authenticated user's cart, then deletes the guest cart.
 * @param {object} data data to merge the guest cart into the user's cart
 * @param {number} data.userId
 * @param {string} data.sessionToken session token
 * @returns {Promise<{ merged: boolean, moved_items: number }>} the merged flag and the number of moved items
 * @throws {ValidationError} If a merged line would exceed max quantity, is inactive, or is over stock
 * @throws {DatabaseError} On database failures
 */
async function mergeGuestCartIntoUser({ userId, sessionToken }) {
    try {
        const valid = validateMergeGuestCart({
            userId: validateUserId(userId),
            sessionToken,
        });

        // transactionally merge the guest cart into the user's cart
        return await cartDAO.mergeGuestCartIntoUser({
            userId: valid.userId,
            sessionToken: valid.sessionToken,
            maxQuantity: VALIDATIONS.QUANTITY.MAX,
            validateLine: async ({ cid, configId }) => {
                await assertConfigBelongsToCatalog(
                    validateCatalogItemId(cid),
                    configId,
                );
            },
        });
    } catch (err) {
        log.error(
            "Cart",
            "mergeGuestCartIntoUser",
            "mergeGuestCartIntoUser failed",
            err,
        );
        throw err;
    }
}

export {
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    mergeGuestCartIntoUser,
};
