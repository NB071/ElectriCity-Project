// IAM Access Management
// CQRS - Queries (authentication & authorization)

import jwt from "jsonwebtoken";
import accessDAO from "./accessDAO.js";
import accountDAO from "../_identity/accountDAO.js";
import { JWT } from "./constants.js";
import env from "../../../configs/env.js";
import {
    validateAuthorizationContext,
    validateBearerToken,
} from "./accessValidator.js";
import {
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
} from "../../../utils/errors.js";
import { toAuthenticatedUserDTO } from "./DTOs/authenticatedUserDTO.js";
import { toSessionListDTO } from "./DTOs/sessionListDTO.js";
import { validateListUserSessionsContext } from "./accessValidator.js";

/**
 * This function extracts, validates, and verifies a Bearer access JWT.
 * @used_by middlewares/authn.middleware.js
 * @param {string|undefined} authorizationHeader Value of the Authorization header
 * @returns {Promise<object>} req.user shape: { user_id, role, email, jti, exp, sid }
 * @throws {UnauthorizedError} If header is missing, malformed, token is invalid, expired, revoked, or the user no longer exists
 * @throws {DatabaseError} If a database operation fails
 */
async function authenticateAccessToken(authorizationHeader) {
    // if validation fails, throw UnauthorizedError (instead of ValidationError)
    let accessToken;
    try {
        accessToken = validateBearerToken(authorizationHeader);
    } catch {
        throw new UnauthorizedError(
            "Missing or malformed Authorization header",
        );
    }

    let payload;
    try {
        payload = jwt.verify(accessToken, env.jwt.JWT_SIGN_KEY, {
            algorithms: [JWT.ALGORITHM],
            issuer: JWT.ISSUER,
        });
    } catch {
        throw new UnauthorizedError("Invalid or expired access token");
    }

    const { user_id, jti, exp, sid } = payload;
    if (!user_id || !jti || !sid) {
        throw new UnauthorizedError("Malformed access token");
    }

    // Access tokens are allowlisted by their session
    const session = await accessDAO.findSessionById(sid);
    if (!session || session.revoked_at !== null) {
        throw new UnauthorizedError("Session has been revoked");
    }
    if (session.user_id !== user_id) {
        throw new UnauthorizedError("Malformed access token");
    }
    if (session.current_access_jti !== jti) {
        throw new UnauthorizedError("Access token is no longer valid");
    }

    let user;
    try {
        // Filter soft-deleted users
        user = await accountDAO.findById(user_id);
    } catch (err) {
        if (err instanceof NotFoundError) {
            throw new UnauthorizedError("User account no longer exists");
        }
        throw err;
    }

    return toAuthenticatedUserDTO({ user, jti, exp, sid });
}

/**
 * This function lists the authenticated user's active login sessions for the profile UI
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.currentSessionId Session id from the access token claims
 * @returns {Promise<{ sessions: object[] }>}
 * @throws {ValidationError} If validation fails
 * @throws {DatabaseError} If a database operation fails
 */
async function listUserSessions({ userId, currentSessionId }) {
    const validated = validateListUserSessionsContext({
        userId,
        currentSessionId,
    });

    const rows = await accessDAO.findActiveSessionsByUserId(validated.userId);

    return toSessionListDTO(rows, validated.currentSessionId);
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

export { authenticateAccessToken, authorizeUser, listUserSessions };
