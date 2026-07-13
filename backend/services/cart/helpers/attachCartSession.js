// Cart Service (Helpers)

import { CART_COOKIES, CART_HEADERS } from "../constants.js";
import {
    setCartSessionCookie,
    clearCartSessionCookie,
} from "./cartSessionCookie.js";

/**
 * This function attaches the guest cart session as an httpOnly cookie (and response
 * header for API tools) when a session token is present. Clears the cookie when the
 * response is for a customer cart with no guest session.
 * @helper_function
 * @param {import("express").Response} res
 * @param {object} payload
 * @returns {object} the payload
 */
function attachCartSession(res, payload) {
    if (payload?.session_token) {
        setCartSessionCookie(res, payload.session_token);
        res.set(CART_HEADERS.SESSION, payload.session_token);
    } else if (payload && payload.is_guest === false) {
        clearCartSessionCookie(res);
    }
    return payload;
}

/**
 * This function reads the guest cart session from the httpOnly cookie, falling back
 * to the X-Cart-Session header for API tools / tests.
 * @helper_function
 * @param {import("express").Request} req
 * @returns {string|null}
 */
function cartSessionFromRequest(req) {
    return (
        req.cookies?.[CART_COOKIES.SESSION] ??
        req.headers[CART_HEADERS.SESSION] ??
        null
    );
}

export { attachCartSession, cartSessionFromRequest };
