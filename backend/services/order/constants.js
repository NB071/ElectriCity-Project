const CHECKOUT_ACTORS = {
    CUSTOMER: "customer",
    GUEST: "guest",
};

const ADDRESS_TYPES = {
    SHIPPING: "shipping",
    BILLING: "billing",
};

const TAX_RATES_BY_PROVINCE = {
    AB: 0.05,
    BC: 0.12,
    MB: 0.12,
    NB: 0.15,
    NL: 0.15,
    NS: 0.15,
    NT: 0.05,
    NU: 0.05,
    ON: 0.13,
    PE: 0.15,
    QC: 0.14975,
    SK: 0.11,
    YT: 0.05,
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
        UNPAID: "unpaid",
        PAID: "paid",
        FAILED: "failed",
    },

    /**
     * Allowed admin order_status transitions.
     * Shipping/delivery also require payment_status === paid
     */
    ORDER_STATUS_TRANSITIONS: {
        pending: ["confirmed", "cancelled"],
        confirmed: ["shipped", "cancelled"],
        shipped: ["delivered"],
        delivered: [],
        cancelled: [],
    },

    /**
     * Allowed payment_status transitions
     * paid is terminal here; no unpaid/failed revert.
     */
    PAYMENT_STATUS_TRANSITIONS: {
        unpaid: ["paid", "failed"],
        failed: ["paid", "unpaid"],
        paid: [],
    },

    CHECKOUT_ACTORS: [CHECKOUT_ACTORS.CUSTOMER, CHECKOUT_ACTORS.GUEST],

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
    TAX_RATE: TAX_RATES_BY_PROVINCE.ON,
};

export {
    CHECKOUT_ACTORS,
    ADDRESS_TYPES,
    TAX_RATES_BY_PROVINCE,
    VALIDATIONS,
    DEFAULTS,
};
