// Chatbot Service
// Constants

const TEMPLATES = {
    PRODUCT_INQUIRY: "product-inquiry",
    CART_ASSIST: "cart-assist",
    GENERAL_SUPPORT: "general-support",
};

const VALIDATIONS = {
    TEMPLATE_NAMES: [
        TEMPLATES.PRODUCT_INQUIRY,
        TEMPLATES.CART_ASSIST,
        TEMPLATES.GENERAL_SUPPORT,
    ],

    USER_MESSAGE: {
        MIN: 1,
        MAX: 2000,
    },

    CONTEXT_BLOCK: {
        MAX: 10,
        MAX_LENGTH: 4000,
    },
};

const DEFAULTS = {
    TEMPLATE: TEMPLATES.GENERAL_SUPPORT,
};

const ROLES = {
    SYSTEM: "system",
    USER: "user",
    ASSISTANT: "assistant",
};

export { TEMPLATES, VALIDATIONS, DEFAULTS, ROLES };
