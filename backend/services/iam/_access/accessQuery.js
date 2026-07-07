// IAM Access Management
// CQRS - Queries (authentication & authorization)

import jwt from "jsonwebtoken";
import tokenDAO from "./tokenDAO.js";
import accountDAO from "../_identity/accountDAO.js";
import { JWT } from "./constants.js";
import env from "../../../configs/env.js";
import { validateAuthorizationContext } from "./accessValidator.js";
import {
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
} from "../../../utils/errors.js";

/**
 * This function verifies an access JWT and returns the authenticated user context.
 * The token is expected to carry a `user_id` claim and a `jti` (set via jwtid on sign).
 * @used_by middlewares/authn.middleware.js
 * @param {string} accessToken Raw JWT from the Authorization header
 * @returns {Promise<object>} req.user shape: { user_id, role, email, jti, exp }
 * @throws {UnauthorizedError} If token is missing, invalid, expired, blocklisted, or the user no longer exists
 */
async function authenticateAccessToken(accessToken) {
    let payload;
    try {
        payload = jwt.verify(accessToken, env.jwt.JWT_SIGN_KEY, {
            algorithms: [JWT.ALGORITHM],
            issuer: JWT.ISSUER,
        });
    } catch {
        throw new UnauthorizedError("Invalid or expired access token");
    }

    const { user_id, jti, exp } = payload;
    if (!user_id || !jti) {
        throw new UnauthorizedError("Malformed access token");
    }

    if (await tokenDAO.isBlocklisted(jti)) {
        throw new UnauthorizedError("Access token has been revoked");
    }

    let user;
    try {
        // findById filters soft-deleted users and throws NotFoundError if gone
        user = await accountDAO.findById(user_id);
    } catch (err) {
        if (err instanceof NotFoundError) {
            throw new UnauthorizedError("User account no longer exists");
        }
        throw err;
    }

    return {
        user_id: user.user_id,
        role: user.role,
        email: user.email,
        jti,
        exp,
    };
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
    validateAuthorizationContext(user?.role, ...allowedRoles);
    if (!allowedRoles.includes(user.role)) {
        throw new ForbiddenError();
    }
}

export { authenticateAccessToken, authorizeUser };
