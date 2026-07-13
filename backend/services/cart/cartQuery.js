// Cart Service
// CQRS - Query side (reads)

import cartDAO from "./cartDAO.js";
import CartRegistry from "./ownership/cartRegistry.js";
import {
    validateCartOwner,
    validateSortParams,
    validateUserId,
} from "./cartValidator.js";
import { resolveCartKind } from "./helpers/resolveCartKind.js";
import { ValidationError } from "../../utils/errors.js";
import {
    parsePaginationQuery,
    validatePaginationParams,
    paginationMeta,
} from "../../utils/pagination.js";
import log from "../../utils/logger.js";

const cartRegistry = new CartRegistry({ cartDAO });

/**
 * This function returns an empty guest cart payload.
 * @param {string} sort sort key
 * @param {{ page: number, limit: number, offset: number }} pagination pagination parameters
 * @returns {object}
 */
function emptyAnonymousCart(sort, pagination) {
    return {
        cart_id: null,
        items: [],
        pagination: paginationMeta({ ...pagination, total: 0 }),
        sort,
        session_token: null,
        is_guest: true,
    };
}

/**
 * This function returns the caller's cart (customer or guest) with paginated items.
 * @param {{ userId?: number|null, sessionToken?: string|null }|number|string} ownerOrUserId
 * @param {object} [queryParams] The query parameters
 * @returns {Promise<object>} The cart with paginated items
 */
async function viewCart(ownerOrUserId, queryParams = {}) {
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

        // validate the pagination parameters
        if (!validatePaginationParams(queryParams)) {
            throw new ValidationError("Invalid pagination parameters.");
        }

        // validate and parse the sort and pagination parameters
        const { sort } = validateSortParams(queryParams);
        const pagination = parsePaginationQuery(queryParams);

        if (owner.userId == null) {
            // if the owner is a guest and has no session token, return an empty cart
            if (owner.sessionToken == null) {
                return emptyAnonymousCart(sort, pagination);
            }

            // if the owner is a guest and has a session token, find the active guest cart
            const activeGuest = await cartDAO.findActiveGuestCartBySessionToken(
                owner.sessionToken,
            );

            // if the active guest cart is not found, return an empty cart
            if (!activeGuest) {
                return emptyAnonymousCart(sort, pagination);
            }
        }

        // get the cart handler
        const handler = cartRegistry.get(resolveCartKind(owner));

        // return the cart with paginated items
        return handler.viewCart(owner, { sort, pagination });
    } catch (err) {
        log.error("Cart", "viewCart", "viewCart failed", err);
        throw err;
    }
}

export { viewCart };
