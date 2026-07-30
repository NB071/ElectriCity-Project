const CHECKOUT_ACTORS = {
    CUSTOMER: "customer",
    GUEST: "guest",
};

const ADDRESS_TYPES = {
    SHIPPING: "shipping",
    BILLING: "billing",
};

/**
 * Canadian sales-tax components by province/territory.
 * `pst` includes QST for Quebec. `type` describes which components apply.
 * `applicable` is derived as gst + pst + hst.
 */
const TAX_BREAKDOWN_BY_PROVINCE = {
    AB: { type: "gst", gst: 0.05, pst: 0, hst: 0 },
    BC: { type: "gst_pst", gst: 0.05, pst: 0.07, hst: 0 },
    MB: { type: "gst_pst", gst: 0.05, pst: 0.07, hst: 0 },
    NB: { type: "hst", gst: 0, pst: 0, hst: 0.15 },
    NL: { type: "hst", gst: 0, pst: 0, hst: 0.15 },
    NS: { type: "hst", gst: 0, pst: 0, hst: 0.15 },
    NT: { type: "gst", gst: 0.05, pst: 0, hst: 0 },
    NU: { type: "gst", gst: 0.05, pst: 0, hst: 0 },
    ON: { type: "hst", gst: 0, pst: 0, hst: 0.13 },
    PE: { type: "hst", gst: 0, pst: 0, hst: 0.15 },
    QC: { type: "gst_pst", gst: 0.05, pst: 0.09975, hst: 0 },
    SK: { type: "gst_pst", gst: 0.05, pst: 0.06, hst: 0 },
    YT: { type: "gst", gst: 0.05, pst: 0, hst: 0 },
};

const TAX_RATES_BY_PROVINCE = Object.fromEntries(
    Object.entries(TAX_BREAKDOWN_BY_PROVINCE).map(([code, parts]) => [
        code,
        Number((parts.gst + parts.pst + parts.hst).toFixed(5)),
    ]),
);

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
    TAX_PROVINCE: "ON",
};

export {
    CHECKOUT_ACTORS,
    ADDRESS_TYPES,
    TAX_BREAKDOWN_BY_PROVINCE,
    TAX_RATES_BY_PROVINCE,
    VALIDATIONS,
    DEFAULTS,
};
