const CHECKOUT_ACTORS = {
    CUSTOMER: "customer",
    ADMIN: "admin",
};

const ADDRESS_TYPES = {
    SHIPPING: "shipping",
    BILLING: "billing",
};

const VALIDATIONS = {
    ORDER_STATUS: {
        PENDING: "pending",
        CONFIRMED: "confirmed",
        SHIPPED: "shipped",
        DELIVERED: "delivered",
        CANCELLED: "cancelled",
    },

    PAYMENT_STATUS: {
        PAID: "paid",
        FAILED: "failed",
    },

    CHECKOUT_ACTORS: [CHECKOUT_ACTORS.CUSTOMER, CHECKOUT_ACTORS.ADMIN],

    ADDRESS_TYPES: [ADDRESS_TYPES.SHIPPING, ADDRESS_TYPES.BILLING],

    QUANTITY: {
        MIN: 1,
        MAX: 99,
    },

    ADDRESS: {
        NAME_MAX_LENGTH: 150,
        PHONE_MAX_LENGTH: 20,
        STREET_MAX_LENGTH: 255,
        CITY_MAX_LENGTH: 100,
        PROVINCE_MAX_LENGTH: 100,
        COUNTRY_MAX_LENGTH: 100,
        POSTAL_CODE_MAX_LENGTH: 20,
    },

    GUEST_EMAIL: {
        MAX_LENGTH: 255,
    },
};

const DEFAULTS = {
    TAX_RATE: 0.13,
};

export { CHECKOUT_ACTORS, ADDRESS_TYPES, VALIDATIONS, DEFAULTS };
