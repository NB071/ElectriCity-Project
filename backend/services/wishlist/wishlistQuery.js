// Wishlist Service
// CQRS - Query side (reads)

import wishlistDAO from "./wishlistDAO.js";
import {
    validateUserId,
    validateWishlistEntry,
    validateSortParams,
} from "./wishlistValidator.js";
import { ValidationError } from "../../utils/errors.js";
import {
    parsePaginationQuery,
    paginationMeta,
    validatePaginationParams,
} from "../../utils/pagination.js";
import { toWishlistItemDTO } from "./DTOs/wishlistItemDTO.js";
import { toWishlistEntryDTO } from "./DTOs/wishlistEntryDTO.js";
import log from "../../utils/logger.js";

/**
 * This function returns paginated wishlist items for a user.
 * @requiredRole customer
 * @param {number|string} userId userId of the user from JWT Token
 * @param {object} [queryParams] Raw query params (page, limit, sort)
 * @returns {Promise<{ items: object[], pagination: object, sort: string }>}
 * @throws {ValidationError} If the pagination or sort parameters are invalid
 * @throws {DatabaseError} On database failures
 */
async function viewWishlist(userId, queryParams = {}) {
    try {
        const id = validateUserId(userId);

        if (!validatePaginationParams(queryParams)) {
            throw new ValidationError("Invalid pagination parameters.");
        }

        const { sort } = validateSortParams(queryParams);
        const pagination = parsePaginationQuery(queryParams);
        const total = await wishlistDAO.countByUserId(id);
        const rows =
            total === 0
                ? []
                : await wishlistDAO.findByUserId(
                      id,
                      pagination.limit,
                      pagination.offset,
                      sort,
                  );

        return {
            items: rows.map(toWishlistItemDTO),
            pagination: paginationMeta({ ...pagination, total }),
            sort,
        };
    } catch (err) {
        log.error("Wishlist", "viewWishlist", "viewWishlist failed", err);
        throw err;
    }
}

/**
 * This function checks whether a catalog item is in a user's wishlist.
 * @requiredRole customer
 * @param {number|string} userId userId of the user from JWT Token
 * @param {number|string} cid catalog item id
 * @returns {Promise<{ user_id: number, cid: number, added_at: string }>}
 * @throws {ValidationError} If the wishlist data is invalid
 * @throws {DatabaseError} On database failures
 * @throws {NotFoundError} If the item is not in the wishlist
 */
async function isInWishlist(userId, cid) {
    try {
        const valid = validateWishlistEntry({ userId, cid });
        const row = await wishlistDAO.findEntry(valid.userId, valid.cid);
        return toWishlistEntryDTO(row);
    } catch (err) {
        log.error("Wishlist", "isInWishlist", "isInWishlist failed", err);
        throw err;
    }
}

export { viewWishlist, isInWishlist };
