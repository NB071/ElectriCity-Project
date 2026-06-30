// Catalog Service
// Constants

const ITEM_TYPES = {
    VEHICLE: "vehicle",
};

const PROMO_TYPES = {
    HOT_DEAL: "hot_deal",
    SEASONAL: "seasonal",
    CLEARANCE: "clearance",
    FEATURED: "featured",
};

const VALIDATIONS = {
    ITEM_TYPES: [ITEM_TYPES.VEHICLE],

    PROMO_TYPES: [
        PROMO_TYPES.HOT_DEAL,
        PROMO_TYPES.SEASONAL,
        PROMO_TYPES.CLEARANCE,
        PROMO_TYPES.FEATURED,
    ],

    VEHICLE_CONDITIONS: ["new", "used"],

    SORT_VALUES: [
        "price_asc",
        "price_desc",
        "year_desc",
        "year_asc",
        "mileage_asc",
        "mileage_desc",
        "added_desc",
    ],

    COMPARE: {
        MIN_ITEMS: 2,
        MAX_ITEMS: 5,
    },

    SEARCH: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 100,
    },
};

const DEFAULTS = {
    SORT: "added_desc",
    ITEM_TYPE: ITEM_TYPES.VEHICLE,
};

const PROMO_NAME_MATCH = {
    [PROMO_TYPES.HOT_DEAL]: "%hot_deal%",
    [PROMO_TYPES.SEASONAL]: "%seasonal%",
    [PROMO_TYPES.CLEARANCE]: "%clearance%",
    [PROMO_TYPES.FEATURED]: "%featured%",
};

export { ITEM_TYPES, PROMO_TYPES, VALIDATIONS, DEFAULTS, PROMO_NAME_MATCH };
