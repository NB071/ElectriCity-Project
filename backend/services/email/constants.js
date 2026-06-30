// Email Service
// Constants

const TEMPLATES = {
    WELCOME: "welcome",
    ORDER_CONFIRM: "order-confirm",
    ACCOUNT_DELETION: "account-deletion",
};

const VALIDATIONS = {
    TEMPLATE_NAMES: [
        TEMPLATES.WELCOME,
        TEMPLATES.ORDER_CONFIRM,
        TEMPLATES.ACCOUNT_DELETION,
    ],

    SUBJECT_MAX_LENGTH: 200,
};

const DEFAULTS = {
    SUBJECT_PREFIX: "Electricity: ",
    FOOTER_TEXT: "Best regards, EECS 4413 Group G.",
    FALLBACK_SUBJECT: "Email Update",
};

const SUBJECTS = {
    [TEMPLATES.WELCOME]: "Welcome to our platform!",
    [TEMPLATES.ACCOUNT_DELETION]: "Account Deletion Confirmation",
};

const SUBJECT_PREFIX = {
    ORDER_CONFIRM: "Order Confirmation - #",
};

const CTA_LABELS = {
    VISIT_DASHBOARD: "Visit Dashboard",
    VIEW_ORDER: "View Order",
    CONTACT_US: "Contact Us",
};

const CTA_URLS = {
    DASHBOARD: "https://TBD/dashboard",
    CONTACT: "https://TBD/contact",
    order: (orderId) => `https://TBD/dashboard/orders/${orderId}`,
};

export {
    TEMPLATES,
    VALIDATIONS,
    DEFAULTS,
    SUBJECTS,
    SUBJECT_PREFIX,
    CTA_LABELS,
    CTA_URLS,
};
