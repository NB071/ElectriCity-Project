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

    SORT_VALUES: [
        "added_at_desc",
        "added_at_asc",
        "price_asc",
        "price_desc",
    ],

    SESSION_TOKEN: {
        LENGTH: 36,
    },
};

const DEFAULTS = {
    SORT: "added_at_desc",
    QUANTITY: 1,
    GUEST_CART_TTL_DAYS: 30,
};

const CART_HEADERS = {
    SESSION: "x-cart-session",
};

export { CART_KINDS, VALIDATIONS, DEFAULTS, CART_HEADERS };
