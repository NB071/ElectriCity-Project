// ElectriCity store FAQ dictionary (static answers for general support)

const FAQ_TOPICS = {
    ABOUT_STORE: "about_store",
    FINDING_PRODUCTS: "finding_products",
    SEARCH_AND_FILTERS: "search_and_filters",
    VEHICLE_DETAILS: "vehicle_details",
    CUSTOMIZATION: "customization",
    COMPARE_VEHICLES: "compare_vehicles",
    ACCOUNT_LOGIN: "account_login",
    ACCOUNT_MANAGEMENT: "account_management",
    CART: "cart",
    CHECKOUT_ORDERS: "checkout_orders",
    PAYMENTS: "payments",
    REVIEWS: "reviews",
    WISHLIST: "wishlist",
    CONTACT_SUPPORT: "contact_support",
};

// FAQ dictionary for the store
const STORE_FAQ = {
    // Persona related questions
    [FAQ_TOPICS.ABOUT_STORE]: {
        topic: FAQ_TOPICS.ABOUT_STORE,
        title: "About ElectriCity",
        answer: "ElectriCity is an online store specializing in electric vehicles. We sell new and used EVs from brands like Tesla, Ford, and Toyota. Browse the catalog, compare models, customize options, and check out online or through your account dashboard.",
        keywords: [
            "about",
            "electriCity",
            "who",
            "company",
            "store",
            "sell",
            "what do you",
        ],
    },

    // Product related questions
    [FAQ_TOPICS.FINDING_PRODUCTS]: {
        topic: FAQ_TOPICS.FINDING_PRODUCTS,
        title: "Finding products on the website",
        answer: "Open the Shop / Catalog section to browse all vehicles. Use the vehicle listing page to scroll inventory, or open Search to look up a brand or model by name. Each vehicle card links to a details page with photos, specs, price, and available options.",
        keywords: [
            "find",
            "browse",
            "catalog",
            "where",
            "products",
            "vehicles",
            "website",
            "shop",
            "listing",
        ],
    },

    // Search and filters related questions
    [FAQ_TOPICS.SEARCH_AND_FILTERS]: {
        topic: FAQ_TOPICS.SEARCH_AND_FILTERS,
        title: "Search and filters",
        answer: "Use Search when you know a brand or model name (e.g. Model 3, bZ4X). Use Browse filters to narrow results by price range, new vs used, year, mileage, body style, and drivetrain.",
        keywords: [
            "search",
            "filter",
            "price",
            "used",
            "new",
            "mileage",
            "budget",
            "under",
        ],
    },

    // Vehicle details related questions
    [FAQ_TOPICS.VEHICLE_DETAILS]: {
        topic: FAQ_TOPICS.VEHICLE_DETAILS,
        title: "Vehicle details pages",
        answer: "Click any vehicle in the catalog to open its details page. You will see base price, year, condition, mileage, images, promotions, review summary, options already equipped on the vehicle, and any extra customization options still available for purchase. Used vehicles also show history such as prior owners and accident status.",
        keywords: [
            "details",
            "specs",
            "specifications",
            "photos",
            "images",
            "page",
            "equipped",
            "owners",
        ],
    },

    // Customization related questions
    [FAQ_TOPICS.CUSTOMIZATION]: {
        topic: FAQ_TOPICS.CUSTOMIZATION,
        title: "Customization options",
        answer: "Vehicle details show two kinds of options: equipped options already installed on that car (especially used inventory), and customizations still available for purchase such as color, interior, or wheels with any price delta. After choosing available add-ons, you can save a configuration and add it to your cart. Some vehicles have no extra purchase options.",
        keywords: [
            "custom",
            "customization",
            "color",
            "interior",
            "wheels",
            "options",
            "configure",
            "equipped",
            "add-ons",
            "already installed",
        ],
    },

    // Compare vehicles related questions
    [FAQ_TOPICS.COMPARE_VEHICLES]: {
        topic: FAQ_TOPICS.COMPARE_VEHICLES,
        title: "Compare vehicles",
        answer: "Use Compare on the catalog to view two or more vehicles side by side (price, specs, and key attributes). Select the vehicles you are interested in from browse or search, then open the compare view to decide which fits you best.",
        keywords: ["compare", "comparison", "side by side", "versus", "vs"],
    },

    // Account and login related questions
    [FAQ_TOPICS.ACCOUNT_LOGIN]: {
        topic: FAQ_TOPICS.ACCOUNT_LOGIN,
        title: "Account and login",
        answer: "Create an account or sign in from the site header. A logged-in customer can open the dashboard for orders, wishlist, and profile settings. Wishlist and reviews require an account. You can shop and use a cart as a guest; signing in merges your guest cart into your account cart when your session is still valid. Guest checkout may also be available without signing in.",
        keywords: [
            "account",
            "login",
            "sign in",
            "register",
            "sign up",
            "password",
            "dashboard",
        ],
    },

    // Profile and account management (customer dashboard)
    [FAQ_TOPICS.ACCOUNT_MANAGEMENT]: {
        topic: FAQ_TOPICS.ACCOUNT_MANAGEMENT,
        title: "Account management and profile",
        answer: "Open your customer dashboard and go to the Profile page to manage your account. There you can update your first name, last name, email, and phone number; change your password (your current password is required); and view your active login sessions. To delete your account, use Delete account on the Profile page while signed in and confirm with your current password. Deletion is permanent for login purposes (your account is deactivated), and you will receive a confirmation email. After deletion you cannot sign in with that account. For order history questions after deletion, contact support with your order ID.",
        keywords: [
            "profile",
            "account management",
            "manage account",
            "edit profile",
            "update profile",
            "change email",
            "change password",
            "phone",
            "phone number",
            "delete account",
            "delete my account",
            "remove account",
            "close account",
            "deactivate",
            "sessions",
            "logout all",
            "sign out everywhere",
            "profile page",
            "profile settings",
            "account settings",
        ],
    },

    // Shopping cart related questions
    [FAQ_TOPICS.CART]: {
        topic: FAQ_TOPICS.CART,
        title: "Shopping cart",
        answer: "Add vehicles from the details page to your cart as a guest or while signed in. You can add a base vehicle or a saved configuration. Open the cart to review items, quantities, promotions shown on each vehicle, and totals before checkout. Guests keep a temporary cart for their browsing session; when you sign in, that guest cart is merged into your account cart. After you are logged in, cart contents stay with your account.",
        keywords: [
            "cart",
            "add to cart",
            "basket",
            "items",
            "quantity",
            "guest cart",
            "merge cart",
        ],
    },

    // Checkout and orders related questions
    [FAQ_TOPICS.CHECKOUT_ORDERS]: {
        topic: FAQ_TOPICS.CHECKOUT_ORDERS,
        title: "Checkout and orders",
        answer: "Proceed to checkout from your cart. Enter shipping and billing details, review the order total, and submit payment. After placing an order, view status and history in your customer dashboard. Order confirmation includes your order ID and line items.",
        keywords: [
            "checkout",
            "order",
            "shipping",
            "billing",
            "purchase",
            "buy",
            "track",
        ],
    },

    // Payments related questions
    [FAQ_TOPICS.PAYMENTS]: {
        topic: FAQ_TOPICS.PAYMENTS,
        title: "Payments",
        answer: "We accept major payment methods such as credit card, debit card, and Apple Pay at checkout. If a payment fails, you can retry with another method. Payment status appears on your order in the dashboard once processing completes.",
        keywords: [
            "payment",
            "pay",
            "credit card",
            "debit",
            "apple pay",
            "failed",
        ],
    },

    // Reviews related questions
    [FAQ_TOPICS.REVIEWS]: {
        topic: FAQ_TOPICS.REVIEWS,
        title: "Reviews",
        answer: "Logged-in customers who purchased a vehicle can leave a rating and review on its catalog details page. Reviews help other shoppers and appear as an average rating on listing and detail views.",
        keywords: ["review", "rating", "feedback", "stars"],
    },

    // Wishlist related questions
    [FAQ_TOPICS.WISHLIST]: {
        topic: FAQ_TOPICS.WISHLIST,
        title: "Wishlist",
        answer: "Save vehicles to your wishlist while logged in to compare later or buy when ready. Wishlist status is available from vehicle detail pages for authenticated customers.",
        keywords: ["wishlist", "save", "favorite", "bookmark", "later"],
    },

    // Contact and support related questions
    [FAQ_TOPICS.CONTACT_SUPPORT]: {
        topic: FAQ_TOPICS.CONTACT_SUPPORT,
        title: "Contact and support",
        answer: "For order issues, account help, or questions not answered here, contact ElectriCity support through the Contact page or your dashboard help section. Include your order ID when asking about a specific purchase. Profile and account settings (including delete account) are on the dashboard Profile page.",
        keywords: [
            "contact",
            "support",
            "help",
            "email",
            "phone",
            "customer service",
        ],
    },
};

const FAQ_TOPIC_IDS = Object.values(FAQ_TOPICS);

/**
 * This function returns the FAQ entry for a given topic.
 * @param {string} topic
 * @returns {object|null}
 */
function getFaqByTopic(topic) {
    return STORE_FAQ[topic] ?? null;
}

/**
 * This function searches the FAQ dictionary for a given query.
 * Returns the entry whose keyword is the longest phrase found in the query.
 * @param {string} query
 * @returns {object[]}
 */
function searchFaqByQuery(query) {
    const normalizedQuery = (query ?? "").toLowerCase().trim();
    if (!normalizedQuery) {
        return [];
    }

    let bestMatch = null;
    let bestKeywordLength = 0;

    for (const topicId of FAQ_TOPIC_IDS) {
        const entry = STORE_FAQ[topicId];

        for (const keyword of entry.keywords) {
            const normalizedKeyword = keyword.toLowerCase();

            if (
                normalizedQuery.includes(normalizedKeyword) &&
                normalizedKeyword.length > bestKeywordLength
            ) {
                bestKeywordLength = normalizedKeyword.length;
                bestMatch = {
                    topic: entry.topic,
                    title: entry.title,
                    answer: entry.answer,
                };
            }
        }
    }

    return bestMatch ? [bestMatch] : [];
}

/**
 * This function looks up the FAQ entry for a given topic or query.
 * @param {object} params
 * @param {string} [params.topic]
 * @param {string} [params.query]
 * @returns {object|{ error: { code: string, message: string, available_topics: string[] } }}
 */
function lookupStoreFaq({ topic, query } = {}) {
    if (topic) {
        const entry = getFaqByTopic(topic);

        if (!entry) {
            return {
                error: {
                    code: "NOT_FOUND",
                    message: `Unknown FAQ topic "${topic}".`,
                    available_topics: FAQ_TOPIC_IDS,
                },
            };
        }

        return {
            topic: entry.topic,
            title: entry.title,
            answer: entry.answer,
        };
    }

    const matches = searchFaqByQuery(query ?? "");

    if (matches.length === 0) {
        return {
            error: {
                code: "NOT_FOUND",
                message: "No FAQ entry matched that question.",
                available_topics: FAQ_TOPIC_IDS,
            },
        };
    }

    return matches[0];
}

export {
    FAQ_TOPICS,
    FAQ_TOPIC_IDS,
    STORE_FAQ,
    getFaqByTopic,
    searchFaqByQuery,
    lookupStoreFaq,
};
