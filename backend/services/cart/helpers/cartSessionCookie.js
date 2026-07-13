// Cart Service (Helpers)

import env from "../../../configs/env.js";
import { CART_COOKIES, DEFAULTS } from "../constants.js";

/**
 * This helper sets the guest cart session as an httpOnly cookie.
 * @helper_function
 * @param {import("express").Response} res
 * @param {string} sessionToken
 */
function setCartSessionCookie(res, sessionToken) {
    const secure = env.app.NODE_ENV === "production";
    const maxAgeMs =
        DEFAULTS.GUEST_CART_TTL_DAYS * 24 * 60 * 60 * 1000 ||
        CART_COOKIES.SESSION_MAX_AGE_MS;

    res.cookie(CART_COOKIES.SESSION, sessionToken, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: maxAgeMs,
    });
}

/**
 * This helper clears the guest cart session cookie.
 * @helper_function
 * @param {import("express").Response} res
 */
function clearCartSessionCookie(res) {
    res.clearCookie(CART_COOKIES.SESSION, { path: "/" });
}

export { setCartSessionCookie, clearCartSessionCookie };
