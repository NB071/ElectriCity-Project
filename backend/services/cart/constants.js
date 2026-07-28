// Cart Service
// Constants

const CART_KINDS = {
    CUSTOMER: "customer",
    GUEST: "guest",
};

const VALIDATIONS = {
    QUANTITY: {
        MIN: 1,
        MAX: 99,
    },

    SORT_VALUES: ["added_at_desc", "added_at_asc", "price_asc", "price_desc"],

    SESSION_TOKEN: {
        LENGTH: 36,
    },
};

const DEFAULTS = {
    SORT: "added_at_desc",
    QUANTITY: 1,
    GUEST_CART_TTL_DAYS: 30,
    SUMMARY_PREVIEW_LIMIT: 5,
    SUMMARY_PREVIEW_MAX: 10,
};

const CART_HEADERS = {
    SESSION: "x-cart-session",
};

const CART_COOKIES = {
    SESSION: "cart_session",
    // Keep in sync with DEFAULTS.GUEST_CART_TTL_DAYS.
    SESSION_MAX_AGE_MS: 30 * 24 * 60 * 60 * 1000,
};

export { CART_KINDS, VALIDATIONS, DEFAULTS, CART_HEADERS, CART_COOKIES };
