// IAM Access Management
// CQRS - Queries (authentication & authorization)

import tokenDAO from "./tokenDAO.js";
import {
    validateBearerToken,
    validateAuthorizationContext,
} from "./accessValidator.js";
import {
    UnauthorizedError,
    ForbiddenError,
    ValidationError,
} from "../../../utils/errors.js";

/**
 * This function verifies an access JWT and returns the authenticated user context.
 * @used_by middlewares/authn.middleware.js
 * @param {string} accessToken Raw JWT from the Authorization header
 * @returns {Promise<object>} req.user shape: { user_id, role, jti, ...claims }
 * @throws {ValidationError} If validation fails
 * @throws {UnauthorizedError} If token is missing, invalid, expired, or blocklisted
 */
async function authenticateAccessToken(accessToken) {
    void tokenDAO;
    void accessToken;
    void validateBearerToken;
    // TODO: Verify JWT signature and expiry (use env.jwt.JWT_SIGN_KEY)
    // TODO: Reject if tokenDAO.isBlocklisted(jti) i.e. if the token is blocklisted
    // TODO: Load user by user_id; reject if deleted i.e. if the user is deleted
    // TODO: Return { user_id, role, jti, email, ... } for req.user
    throw new UnauthorizedError("Not implemented");
}

/**
 * This function checks whether the authenticated user has an allowed role.
 * @used_by middlewares/authz.middleware.js
 * @param {object} user Authenticated user from req.user
 * @param {string} user.role
 * @param {...string} allowedRoles e.g. "customer", "admin"
 * @returns {void}
 * @throws {ValidationError} If validation fails
 * @throws {ForbiddenError} If the user's role is not permitted
 */
function authorizeUser(user, ...allowedRoles) {
    void validateAuthorizationContext;
    void user;
    void allowedRoles;
    // TODO: validateAuthorizationContext(user.role, ...allowedRoles) i.e. validate the user's role against the allowed roles
    // TODO: Compare user.role == allowedRoles ?
    // TODO: Throw ForbiddenError when role is not allowed i.e. if the user's role is not in the allowed roles
    throw new ForbiddenError("Not implemented");
}

export { authenticateAccessToken, authorizeUser };
