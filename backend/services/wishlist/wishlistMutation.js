// Wishlist Service
// CQRS - Mutations

import wishlistDAO from "./wishlistDAO.js";
import {
    validateAddToWishlist,
    validateWishlistEntry,
} from "./wishlistValidator.js";
import { toWishlistEntryDTO } from "./DTOs/wishlistEntryDTO.js";
import log from "../../utils/logger.js";

/**
 * This function adds a catalog item to a user's wishlist.
 * @requiredRole customer
 * @param {object} data
 * @param {number} data.userId userId of the user from JWT Token
 * @param {number} data.cid catalog item id
 * @returns {Promise<{ user_id: number, cid: number, added_at: string }>}
 * @throws {ValidationError} If the wishlist data is invalid
 * @throws {DatabaseError} If the insert fails
 * @throws {ConflictError} If the item is already in the wishlist
 */
async function addToWishlist({ userId, cid }) {
    try {
        const valid = validateAddToWishlist({ userId, cid });
        const row = await wishlistDAO.insert({
            user_id: valid.userId,
            cid: valid.cid,
        });
        return toWishlistEntryDTO(row);
    } catch (err) {
        log.error("Wishlist", "addToWishlist", "addToWishlist failed", err);
        throw err;
    }
}

/**
 * This function removes a catalog item from a user's wishlist.
 * @requiredRole customer
 * @param {object} data
 * @param {number} data.userId userId of the user from JWT Token
 * @param {number} data.cid catalog item id
 * @returns {Promise<void>}
 * @throws {ValidationError} If the wishlist data is invalid
 * @throws {NotFoundError} If the item is not in the wishlist
 * @throws {DatabaseError} If the delete fails
 */
async function removeFromWishlist({ userId, cid }) {
    try {
        const valid = validateWishlistEntry({ userId, cid });
        await wishlistDAO.deleteByUserAndCid(valid.userId, valid.cid);
    } catch (err) {
        log.error(
            "Wishlist",
            "removeFromWishlist",
            "removeFromWishlist failed",
            err,
        );
        throw err;
    }
}

export { addToWishlist, removeFromWishlist };
