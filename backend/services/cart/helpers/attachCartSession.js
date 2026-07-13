// Cart Service (Helpers)

import { CART_HEADERS } from "../constants.js";

/**
 * This function attaches the guest cart session token to the response header when present.
 * @helper_function
 * @param {import("express").Response} res
 * @param {object} payload
 * @returns {object} the payload
 */
function attachCartSession(res, payload) {
    if (payload?.session_token) {
        res.set(CART_HEADERS.SESSION, payload.session_token);
    }
    return payload;
}

export { attachCartSession };
