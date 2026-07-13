// Cart Service (Helpers)

import { CART_HEADERS } from "../constants.js";

/**
 * This function extracts the cart owner from the request (JWT user and/or X-Cart-Session).
 * @helper_function
 * @param {import("express").Request} req the request object
 * @returns {{ userId: number|null, sessionToken: string|null }} the cart owner
 * @returns {{ userId: number|null, sessionToken: string|null }}
 */
function cartOwnerFromRequest(req) {
    return {
        userId: req.user?.user_id ?? null,
        sessionToken: req.headers[CART_HEADERS.SESSION] ?? null,
    };
}

export { cartOwnerFromRequest };
