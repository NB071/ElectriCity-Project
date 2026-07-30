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

/**
 * Canonical filter / facet values for vehicle catalog UIs.
 * Browse validators and /vehicles/facets use these so counts stay aligned.
 */
const BODY_SHAPES = [
    "SUV",
    "Sedan",
    "Hatchback",
    "Coupe",
    "Convertible",
    "Truck",
];

const DRIVETRAINS = ["AWD", "FWD", "RWD", "4WD"];

const FACET_FIELDS = ["body_shape", "condition", "drivetrain", "promo"];

const VALIDATIONS = {
    ITEM_TYPES: [ITEM_TYPES.VEHICLE],

    PROMO_TYPES: [
        PROMO_TYPES.HOT_DEAL,
        PROMO_TYPES.SEASONAL,
        PROMO_TYPES.CLEARANCE,
        PROMO_TYPES.FEATURED,
    ],

    VEHICLE_CONDITIONS: ["new", "used"],

    BODY_SHAPES,
    DRIVETRAINS,
    FACET_FIELDS,

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
    /** Max images attached to each browse/search list card */
    LIST_IMAGE_LIMIT: 5,
};

const PROMO_NAME_MATCH = {
    [PROMO_TYPES.HOT_DEAL]: "%hot_deal%",
    [PROMO_TYPES.SEASONAL]: "%seasonal%",
    [PROMO_TYPES.CLEARANCE]: "%clearance%",
    [PROMO_TYPES.FEATURED]: "%featured%",
};

export {
    ITEM_TYPES,
    PROMO_TYPES,
    BODY_SHAPES,
    DRIVETRAINS,
    FACET_FIELDS,
    VALIDATIONS,
    DEFAULTS,
    PROMO_NAME_MATCH,
};
