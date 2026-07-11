// Chatbot Service
// Constants

import { FAQ_TOPIC_IDS } from "./faqDictionary.js";

const TEMPLATES = {
    PRODUCT_INQUIRY: "product-inquiry",
    CART_ASSIST: "cart-assist",
    GENERAL_SUPPORT: "general-support",
};

const TOOLS = {
    BROWSE_VEHICLES: "browse_vehicles",
    SEARCH_VEHICLES: "search_vehicles",
    GET_VEHICLE_DETAILS: "get_vehicle_details",
    GET_CUSTOMIZATION_OPTIONS: "get_customization_options",
    COMPARE_VEHICLES: "compare_vehicles",
    GET_STORE_FAQ: "get_store_faq",
};

const TEMPLATE_TOOLS = {
    [TEMPLATES.PRODUCT_INQUIRY]: [
        TOOLS.BROWSE_VEHICLES,
        TOOLS.SEARCH_VEHICLES,
        TOOLS.GET_VEHICLE_DETAILS,
        TOOLS.GET_CUSTOMIZATION_OPTIONS,
        TOOLS.COMPARE_VEHICLES,
    ],
    [TEMPLATES.CART_ASSIST]: [
        TOOLS.GET_STORE_FAQ,
        TOOLS.BROWSE_VEHICLES,
        TOOLS.GET_VEHICLE_DETAILS,
        TOOLS.GET_CUSTOMIZATION_OPTIONS,
    ],
    [TEMPLATES.GENERAL_SUPPORT]: [
        TOOLS.GET_STORE_FAQ,
        TOOLS.BROWSE_VEHICLES,
        TOOLS.SEARCH_VEHICLES,
    ],
};

const SYSTEM_PROMPTS = {
    BASE: [
        "You are ElectriCity Shop Assistant, a helpful e-commerce chatbot for electric vehicles and related products.",
        "Browse and search tools return paginated results with pagination.total, pagination.page, pagination.limit, and pagination.hasNext.",
        "When you list vehicles from browse_vehicles or search_vehicles, always mention pagination.total (how many match overall).",
        "Only describe the items on the current page. If pagination.total is greater than the number of items returned, say clearly that more matches exist and suggest filters or browsing the catalog on the website. Never imply the partial list is the full inventory.",
    ].join(" "),

    [TEMPLATES.PRODUCT_INQUIRY]: [
        "You help customers discover vehicles, compare models, and understand customization options.",
        "Always use the available tools to fetch real catalog data. Never invent vehicles, prices, stock, or options.",
        "When the user asks for filters (price under $X, new/used, mileage, body type, drivetrain), call browse_vehicles or search_vehicles with the matching filter parameters.",
        "For comparisons, call compare_vehicles with model names (e.g. Model 3, bZ4X) or cids.",
        "For paint, interior, wheels, or other options, call get_customization_options or get_vehicle_details using model_name when the customer does not know the cid.",
        "When tool results include equipped_options and customizations, treat equipped_options as already installed on the vehicle and customizations as optional add-ons still available for purchase (which may be empty).",
        "For used vehicles, also mention history fields such as owners_count and has_accidents when present.",
        "Summarize tool results clearly. Prefer model and brand names in replies; mention cid only when helpful.",
        "If no vehicles match, say so and suggest relaxing filters.",
    ].join(" "),

    [TEMPLATES.CART_ASSIST]: [
        "You help customers with their shopping cart and vehicle selections.",
        "Use get_store_faq for how the cart, checkout, and account flows work on the website.",
        "Use tools to look up vehicles and options when needed. Equipped options are already on the car; customizations are extra purchase options.",
        "Do not invent cart contents or catalog data.",
    ].join(" "),

    [TEMPLATES.GENERAL_SUPPORT]: [
        "You answer general questions about ElectriCity, how to use the website, and our electric vehicle catalog.",
        "For store FAQ (finding products, login, profile and account management, cart, checkout, payments, reviews, support), call get_store_faq with a topic or query; do not invent policies.",
        "Use browse_vehicles or search_vehicles when the user asks about available inventory.",
        "Do not invent specific vehicle details; use catalog tools when factual inventory data is needed.",
    ].join(" "),
};

const VALIDATIONS = {
    TEMPLATE_NAMES: [
        TEMPLATES.PRODUCT_INQUIRY,
        TEMPLATES.CART_ASSIST,
        TEMPLATES.GENERAL_SUPPORT,
    ],

    TOOL_NAMES: Object.values(TOOLS),

    USER_MESSAGE: {
        MIN: 1,
        MAX: 2000,
    },

    CONTEXT_BLOCK: {
        MAX: 10,
        MAX_LENGTH: 4000,
    },

    TOOL_ARGS: {
        PAGE_MIN: 1,
        PAGE_MAX: 100,
        LIMIT_MIN: 1,
        LIMIT_MAX: 10,
        SEARCH_MIN: 1,
        SEARCH_MAX: 100,
        MODEL_NAME_MIN: 1,
        MODEL_NAME_MAX: 100,
        COMPARE_MIN: 2,
        COMPARE_MAX: 5,
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
        FAQ_TOPICS: FAQ_TOPIC_IDS,
        FAQ_QUERY_MIN: 2,
        FAQ_QUERY_MAX: 200,
    },
};

const DEFAULTS = {
    TEMPLATE: TEMPLATES.GENERAL_SUPPORT,
    TOOL_PAGE: 1,
    TOOL_LIMIT: 10,
    TOOL_SORT: "added_desc",
};

const ROLES = {
    SYSTEM: "system",
    USER: "user",
    ASSISTANT: "assistant",
    MODEL: "model",
};

export {
    TEMPLATES,
    TOOLS,
    TEMPLATE_TOOLS,
    SYSTEM_PROMPTS,
    VALIDATIONS,
    DEFAULTS,
    ROLES,
};
