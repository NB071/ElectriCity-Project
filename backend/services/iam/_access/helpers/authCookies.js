// IAM Access Management (Helpers)

import env from "../../../../configs/env.js";
import { AUTH_COOKIES } from "../constants.js";

/**
 * This helper sets the access + refresh tokens as httpOnly cookies instead of exposing
 * them to client-side JS. The refresh cookie is scoped to /api/auth so it is only ever
 * sent to the endpoints that need it.
 * @helper_function
 * @param {import('express').Response} res
 * @param {object} tokens
 * @param {string} tokens.accessToken
 * @param {string} tokens.refreshToken
 */
function setAuthCookies(res, { accessToken, refreshToken }) {
    const secure = env.app.NODE_ENV === "production";

    res.cookie(AUTH_COOKIES.ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: AUTH_COOKIES.ACCESS_TOKEN_MAX_AGE_MS,
    });
    res.cookie(AUTH_COOKIES.REFRESH_TOKEN, refreshToken, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/api/auth",
        maxAge: AUTH_COOKIES.REFRESH_TOKEN_MAX_AGE_MS,
    });
}

/**
 * This helper clears both auth cookies on sign-out.
 * @helper_function
 * @param {import('express').Response} res
 */
function clearAuthCookies(res) {
    res.clearCookie(AUTH_COOKIES.ACCESS_TOKEN, { path: "/" });
    res.clearCookie(AUTH_COOKIES.REFRESH_TOKEN, { path: "/api/auth" });
}

export { setAuthCookies, clearAuthCookies };
