// IAM Service (Facade)

import { register, login, logout, refreshTokens } from "./_access/accessMutation.js";
import { authenticateAccessToken, authorizeUser } from "./_access/accessQuery.js";
import {
    ROLES,
    TOKEN_TYPES,
    JWT,
    AUTH_HEADERS,
    VALIDATIONS,
} from "./_access/constants.js";

const access_management = {
    // Mutations
    register,
    login,
    logout,
    refreshTokens,

    // Queries (middleware)
    authenticateAccessToken,
    authorizeUser,

    // Constants
    ROLES,
    TOKEN_TYPES,
    JWT,
    AUTH_HEADERS,
    VALIDATIONS,
};

const iamService = {
    identity_management: {},
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
    VALIDATIONS,

    access_management,
};
