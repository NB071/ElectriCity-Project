// IAM Identity Management
// Constants

import { VALIDATIONS as ACCESS_VALIDATIONS } from "../_access/constants.js";

const USER_FIELDS = {
    USER_ID: "user_id",
    ROLE: "role",
    FIRST_NAME: "first_name",
    LAST_NAME: "last_name",
    EMAIL: "email",
    PHONE_NUMBER: "phone_number",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
};

const SELECTABLE_FIELDS = Object.values(USER_FIELDS);

const VALIDATIONS = {
    USER_FIELDS,
    SELECTABLE_FIELDS,
    PASSWORD: ACCESS_VALIDATIONS.PASSWORD,
    EMAIL: ACCESS_VALIDATIONS.EMAIL,
    NAME: ACCESS_VALIDATIONS.NAME,
    PHONE: ACCESS_VALIDATIONS.PHONE,
    SEARCH: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 100,
    },
    DELETED_SEARCH_KEYWORDS: {
        DELETED: ["deleted", "true", "yes", "1"],
        ACTIVE: ["active", "false", "no", "0"],
    },
    ADDRESS: {
        STREET_MAX_LENGTH: 255,
        CITY_MAX_LENGTH: 100,
        PROVINCE_MAX_LENGTH: 100,
        COUNTRY_MAX_LENGTH: 100,
        POSTAL_CODE_MAX_LENGTH: 20,
    },
};

const DEFAULTS = {
    PROFILE_FIELDS: [
        USER_FIELDS.USER_ID,
        USER_FIELDS.ROLE,
        USER_FIELDS.FIRST_NAME,
        USER_FIELDS.LAST_NAME,
        USER_FIELDS.EMAIL,
        USER_FIELDS.PHONE_NUMBER,
        USER_FIELDS.CREATED_AT,
        USER_FIELDS.UPDATED_AT,
    ],
    BCRYPT_SALT_ROUNDS: 10,
};

export { USER_FIELDS, SELECTABLE_FIELDS, VALIDATIONS, DEFAULTS };
