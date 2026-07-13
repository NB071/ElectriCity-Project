// IAM Service (Facade)

import {
    register,
    login,
    logout,
    logoutAllDevices,
    refreshTokens,
} from "./_access/accessMutation.js";
import {
    authenticateAccessToken,
    authorizeUser,
    listUserSessions,
} from "./_access/accessQuery.js";
import {
    ROLES,
    JWT,
    AUTH_HEADERS,
    VALIDATIONS as ACCESS_VALIDATIONS,
} from "./_access/constants.js";
import {
    getUserById,
    getCurrentUserProfile,
    viewAllUsers,
    searchUsers,
    getUserAddresses,
    getUserAddress,
} from "./_identity/identityQuery.js";
import {
    updateProfile,
    deleteProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from "./_identity/identityMutation.js";
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
    logoutAllDevices,
    refreshTokens,

    // queries
    authenticateAccessToken,
    authorizeUser,
    listUserSessions,

    // constants
    ROLES,
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
    getUserAddresses,
    getUserAddress,

    // mutations
    updateProfile,
    deleteProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,

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
    logoutAllDevices,
    refreshTokens,

    // Access queries
    authenticateAccessToken,
    authorizeUser,
    listUserSessions,

    // Access constants
    ROLES,
    JWT,
    AUTH_HEADERS,
    ACCESS_VALIDATIONS,

    // Identity queries
    getUserById,
    getCurrentUserProfile,
    viewAllUsers,
    searchUsers,
    getUserAddresses,
    getUserAddress,

    // Identity mutations
    updateProfile,
    deleteProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,

    // Identity constants
    USER_FIELDS,
    SELECTABLE_FIELDS,
    IDENTITY_VALIDATIONS,
    IDENTITY_DEFAULTS,
    access_management,
    identity_management,
};
