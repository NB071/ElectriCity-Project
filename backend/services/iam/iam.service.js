// IAM Service (Facade)

import {
    register,
    login,
    logout,
    refreshTokens,
} from "./_access/accessMutation.js";
import {
    authenticateAccessToken,
    authorizeUser,
} from "./_access/accessQuery.js";
import {
    ROLES,
    TOKEN_TYPES,
    JWT,
    AUTH_HEADERS,
    VALIDATIONS as ACCESS_VALIDATIONS,
} from "./_access/constants.js";
import {
    getUserById,
    getCurrentUserProfile,
    viewAllUsers,
    searchUsers,
} from "./_identity/identityQuery.js";
import { updateProfile, deleteProfile } from "./_identity/identityMutation.js";
import {
    USER_FIELDS,
    SELECTABLE_FIELDS,
    VALIDATIONS as IDENTITY_VALIDATIONS,
    DEFAULTS as IDENTITY_DEFAULTS,
} from "./_identity/constants.js";

const access_management = {
    // mutations
    register,
    login,
    logout,
    refreshTokens,

    // queries
    authenticateAccessToken,
    authorizeUser,

    // constants
    ROLES,
    TOKEN_TYPES,
    JWT,
    AUTH_HEADERS,
    VALIDATIONS: ACCESS_VALIDATIONS,
};

const identity_management = {
    // queries
    getUserById,
    getCurrentUserProfile,
    viewAllUsers,
    searchUsers,

    // mutations
    updateProfile,
    deleteProfile,

    // constants
    USER_FIELDS,
    SELECTABLE_FIELDS,
    VALIDATIONS: IDENTITY_VALIDATIONS,
    DEFAULTS: IDENTITY_DEFAULTS,
};

const iamService = {
    identity_management,
    access_management,
};

export default iamService;

export {
    // Access mutations
    register,
    login,
    logout,
    refreshTokens,

    // Access queries
    authenticateAccessToken,
    authorizeUser,

    // Access constants
    ROLES,
    TOKEN_TYPES,
    JWT,
    AUTH_HEADERS,
    ACCESS_VALIDATIONS,

    // Identity queries
    getUserById,
    getCurrentUserProfile,
    viewAllUsers,
    searchUsers,

    // Identity mutations
    updateProfile,
    deleteProfile,

    // Identity constants
    USER_FIELDS,
    SELECTABLE_FIELDS,
    IDENTITY_VALIDATIONS,
    IDENTITY_DEFAULTS,
    access_management,
    identity_management,
};
