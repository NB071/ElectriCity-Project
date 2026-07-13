// IAM Access Management
// Constants

const ROLES = {
    CUSTOMER: "customer",
    ADMIN: "admin",
};

const JWT = {
    ACCESS_EXPIRY: "15m",
    REFRESH_EXPIRY: "7d",
    ALGORITHM: "HS256",
    ISSUER: "electricity",
};

const AUTH_HEADERS = {
    AUTHORIZATION: "authorization",
    BEARER_PREFIX: "Bearer ",
};

const AUTH_COOKIES = {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    ACCESS_TOKEN_MAX_AGE_MS: 15 * 60 * 1000,
    REFRESH_TOKEN_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000,
};

const VALIDATIONS = {
    ROLES,
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
    },
    EMAIL: {
        MAX_LENGTH: 255,
    },
    NAME: {
        MAX_LENGTH: 100,
    },
    PHONE: {
        MAX_LENGTH: 20,
    },
    SESSION_ID: {
        LENGTH: 36,
    },
    DEVICE_LABEL: {
        MAX_LENGTH: 100,
    },
};

const DEFAULTS = {
    BCRYPT_SALT_ROUNDS: 10,
};

export { ROLES, JWT, AUTH_HEADERS, AUTH_COOKIES, VALIDATIONS, DEFAULTS };
