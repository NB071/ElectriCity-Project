// Cart Service
// Constants

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
};

const DEFAULTS = {
    SORT: "added_at_desc",
    QUANTITY: 1,
};

export { VALIDATIONS, DEFAULTS };
