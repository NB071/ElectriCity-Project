// Axios integration constants

export const AUTH_COOKIES = {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
} as const;

export const CART_HEADERS = {
    SESSION: "x-cart-session",
} as const;

export const CART_COOKIES = {
    SESSION: "cart_session",
} as const;

export const AUTH_PATHS = {
    REFRESH: "/api/auth/refresh",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    LOGOUT_ALL: "/api/auth/logout-all",
    ME: "/api/auth/me",
} as const;
