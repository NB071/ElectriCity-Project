// Cart Service (Helpers)

import { cartSessionFromRequest } from "./attachCartSession.js";

/**
 * This function extracts the cart owner from the request (JWT user and/or guest
 * cart session cookie / X-Cart-Session header).
 * @helper_function
 * @param {import("express").Request} req the request object
 * @returns {{ userId: number|null, sessionToken: string|null }} the cart owner
 */
function cartOwnerFromRequest(req) {
    return {
        userId: req.user?.user_id ?? null,
        sessionToken: cartSessionFromRequest(req),
    };
}

export { cartOwnerFromRequest };
