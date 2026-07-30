// Analytics Service
// Constants

const EVENT_DEFINITIONS = {
    CATALOG: {
        HOT_DEALS_VIEW: 1,
        VEHICLE_DETAILS_VIEW: 2,
    },
    CART: {
        ADD: 3,
        REMOVE: 4,
    },
    ORDER: {
        PURCHASE: 5,
    },
    IAM: {
        EDIT_PROFILE: 6,
        DELETE_ACCOUNT: 7,
    },
    REVIEW: {
        PUBLISH_REVIEW: 8,
        DELETE_REVIEW: 9,
    },
    WISHLIST: {
        ADD: 10,
        REMOVE: 11,
    },
};

// Derived from EVENT_DEFINITIONS above
const EVENT_IDS = new Set(
    Object.values(EVENT_DEFINITIONS).flatMap((group) => Object.values(group)),
);

const REPORT_DEFAULTS = {
    DAYS: 30,
    LIMIT: 10,
    MAX_RANGE_DAYS: 366,
};

const EVENT_LIST = {
    SEARCH: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 100,
    },
};

// Redis related constants
const REDIS = {
    CACHE_CHANNEL: "analytics:event-type:invalidate",
};

export { EVENT_DEFINITIONS, REPORT_DEFAULTS, EVENT_LIST, EVENT_IDS, REDIS };
