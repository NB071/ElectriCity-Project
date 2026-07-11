// IAM Access Management
// CQRS - Mutations

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { UAParser } from "ua-parser-js";
import accessDAO from "./accessDAO.js";
import accountDAO from "../_identity/accountDAO.js";
import {
    validateRegisterInput,
    validateLoginInput,
    validateRefreshTokenInput,
    validateLogoutContext,
    validateLogoutAllContext,
} from "./accessValidator.js";
import { JWT, DEFAULTS, VALIDATIONS } from "./constants.js";
import env from "../../../configs/env.js";
import {
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    InternalError,
} from "../../../utils/errors.js";
import { toRegisterResponseDTO } from "./DTOs/registerResponseDTO.js";
import { toAuthSessionDTO } from "./DTOs/authSessionDTO.js";
import { toTokenPairDTO } from "./DTOs/authTokenDTO.js";

/**
 * Generates a unique JWT ID (jti) for a single token.
 * Kept similar to `generateSessionId()` to open the door for future improvements.
 * @private
 * @helper_function
 * @returns {string}
 */
function generateJti() {
    return crypto.randomUUID({ disableEntropyCache: true });
}

/**
 * Generates a session id (sid) shared across a login's token chain.
 * Kept similar to `generateJti()` to open the door for future improvements.
 * @private
 * @helper_function
 * @returns {string}
 */
function generateSessionId() {
    return crypto.randomUUID({ disableEntropyCache: true });
}

/**
 * This helper function hashes a token for storage in the database.
 * @private
 * @helper_function
 * @param {string} rawToken
 * @returns {string} 64-char hex digest

 */
function hashToken(rawToken) {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * This helper function derives a short device label from a User-Agent string for session visibility.
 * @private
 * @helper_function
 * @param {string|null|undefined} userAgent
 * @returns {string|null}
 */
function parseDeviceLabel(userAgent) {
    if (!userAgent || typeof userAgent !== "string") {
        return null;
    }

    const ua = userAgent.trim();
    if (!ua) {
        return null;
    }

    const { browser, os, device } = new UAParser(ua).getResult();
    const browserName = browser.name?.replace(/^Mobile\s+/i, "") || null;
    const platform = device.model || os.name || null;

    const label =
        browserName && platform
            ? `${browserName} on ${platform}`
            : (browserName ?? platform ?? null);

    if (!label) {
        return null;
    }

    return label.slice(0, VALIDATIONS.DEVICE_LABEL.MAX_LENGTH);
}

/**
 * Signs a short-lived access JWT carrying user_id + role + session claims.
 * @private
 * @helper_function
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.role
 * @param {string} data.jti
 * @param {string} data.sid Session id shared with the paired refresh token
 * @returns {string}
 */
function signAccessToken({ userId, role, jti, sid }) {
    return jwt.sign({ user_id: userId, role, sid }, env.jwt.JWT_SIGN_KEY, {
        algorithm: JWT.ALGORITHM,
        issuer: JWT.ISSUER,
        expiresIn: JWT.ACCESS_EXPIRY,
        jwtid: jti,
    });
}

/**
 * Signs a long-lived refresh JWT
 * @private
 * @helper_function
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.jti
 * @param {string} data.sid Session id shared with the paired access token
 * @returns {string}
 */
function signRefreshToken({ userId, jti, sid }) {
    return jwt.sign({ user_id: userId, sid }, env.jwt.JWT_SIGN_KEY, {
        algorithm: JWT.ALGORITHM,
        issuer: JWT.ISSUER,
        expiresIn: JWT.REFRESH_EXPIRY,
        jwtid: jti,
    });
}

/**
 * Signs a fresh (access, refresh) token pair without persisting anything.
 * Both tokens share a session id (sid) so a single session can be revoked
 * on logout without affecting the user's other devices. The returned refresh
 * metadata is what the DAO needs to persist the refresh token row.
 * @private
 * @helper_function
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.role
 * @param {string} [data.sid] Existing session id (defaults to a new session)
 * @returns {{
 *   accessToken: string,
 *   refreshToken: string,
 *   sid: string,
 *   accessJti: string,
 *   refreshRecord: { jti: string, sessionId: string, userId: number, tokenHash: string, expiresAt: Date }
 * }}
 */
function buildTokenPair({ userId, role, sid = generateSessionId() }) {
    const accessJti = generateJti();
    const accessToken = signAccessToken({
        userId,
        role,
        jti: accessJti,
        sid,
    });

    const refreshJti = generateJti();
    const refreshToken = signRefreshToken({ userId, jti: refreshJti, sid });
    const decoded = jwt.decode(refreshToken);
    const exp = decoded?.exp;
    if (typeof exp !== "number") {
        throw new InternalError("Failed to derive refresh token expiry");
    }

    return {
        accessToken,
        refreshToken,
        sid,
        accessJti,
        refreshRecord: {
            jti: refreshJti,
            sessionId: sid,
            userId,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(exp * 1000),
        },
    };
}

/**
 * This function registers a new customer account.
 * Creates a users row with hashed password and default customer role.
 * @param {object} data
 * @param {string} data.firstName
 * @param {string} data.lastName
 * @param {string} data.email
 * @param {string} data.password
 * @param {string|null} [data.phoneNumber]
 * @returns {Promise<object>} Created user summary (no password fields)
 * @throws {ValidationError} If validation fails
 * @throws {ConflictError} If the email is already registered
 * @throws {DatabaseError} If insert fails
 */
async function register({ firstName, lastName, email, password, phoneNumber }) {
    const validated = validateRegisterInput({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
    });

    const passwordHash = await bcrypt.hash(
        validated.password,
        DEFAULTS.BCRYPT_SALT_ROUNDS,
    );

    const row = await accountDAO.create({
        firstName: validated.firstName,
        lastName: validated.lastName,
        email: validated.email,
        passwordHash,
        phoneNumber: validated.phoneNumber ?? null,
    });

    return toRegisterResponseDTO(row);
}

/**
 * This function authenticates credentials, opens a session, and issues (access, refresh) pair of JWT tokens.
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.password
 * @param {string|null} [data.ipAddress] Request IP for session visibility
 * @param {string|null} [data.userAgent] Request user agent for session visibility
 * @returns {Promise<object>} { accessToken, refreshToken, user }
 * @throws {ValidationError} If validation fails
 * @throws {UnauthorizedError} If credentials are invalid
 * @throws {ConflictError} If the session or refresh token already exists
 * @throws {DatabaseError} If a database operation fails
 */
async function login({ email, password, ipAddress = null, userAgent = null }) {
    const validated = validateLoginInput({ email, password });

    const user = await accountDAO.findByEmail(validated.email);
    if (!user) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(
        validated.password,
        user.password_hash,
    );
    if (!passwordMatches) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const { accessToken, refreshToken, sid, accessJti, refreshRecord } =
        buildTokenPair({
            userId: user.user_id,
            role: user.role,
        });

    await accessDAO.createSessionWithRefreshToken({
        session: {
            sessionId: sid,
            userId: user.user_id,
            accessJti,
            ipAddress,
            userAgent,
            deviceLabel: parseDeviceLabel(userAgent),
        },
        refreshRecord,
    });

    return toAuthSessionDTO({ accessToken, refreshToken, user });
}

/**
 * This function revokes the current session (per-device logout): it marks the session as revoked
 * so that its access token stops validating and deletes the session's refresh tokens.
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.sid Session id from the access token claims
 * @returns {Promise<void>}
 * @throws {ValidationError} If validation fails
 * @throws {UnauthorizedError} If the session does not belong to the user
 * @throws {DatabaseError} If a database operation fails
 */
async function logout({ userId, sid }) {
    const validated = validateLogoutContext({ userId, sid });

    const session = await accessDAO.findSessionById(validated.sid);
    if (!session || session.user_id !== validated.userId) {
        throw new UnauthorizedError("Session not found");
    }

    await accessDAO.endSession(validated.sid);
}

/**
 * This function revokes every session for the user (global sign-out on all devices).
 * It marks all sessions revoked and deletes all of the user's refresh tokens.
 * @param {object} data
 * @param {number} data.userId
 * @returns {Promise<void>}
 * @throws {ValidationError} If validation fails
 * @throws {DatabaseError} If a database operation fails
 */
async function logoutAllDevices({ userId }) {
    const validated = validateLogoutAllContext({ userId });

    await accessDAO.endAllSessionsByUserId(validated.userId);
}

/**
 * This function rotates refresh tokens and issues a new access token.
 * @param {string} refreshToken Raw refresh JWT from body or cookie
 * @param {object} [context] Request context used to refresh session visibility
 * @param {string|null} [context.ipAddress] Request IP for session visibility
 * @param {string|null} [context.userAgent] Request user agent for session visibility
 * @returns {Promise<object>} { accessToken, refreshToken }
 * @throws {ValidationError} If validation fails
 * @throws {UnauthorizedError} If token is invalid, expired, revoked, or replaced
 * @throws {ForbiddenError} If the user no longer exists
 * @throws {ConflictError} If the new refresh token already exists
 * @throws {DatabaseError} If a database operation fails
 */
async function refreshTokens(
    refreshToken,
    { ipAddress = null, userAgent = null } = {},
) {
    const validated = validateRefreshTokenInput(refreshToken);

    let payload;
    try {
        payload = jwt.verify(validated, env.jwt.JWT_SIGN_KEY, {
            algorithms: [JWT.ALGORITHM],
            issuer: JWT.ISSUER,
        });
    } catch {
        throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const { user_id: userId, jti, sid } = payload;
    if (!userId || !jti || !sid) {
        throw new UnauthorizedError("Malformed refresh token");
    }

    const stored = await accessDAO.findRefreshTokenByJti(jti);
    if (!stored || stored.replaced_by !== null) {
        throw new UnauthorizedError("Refresh token is no longer valid");
    }

    if (new Date(stored.expires_at) < new Date()) {
        throw new UnauthorizedError("Refresh token has expired");
    }

    if (stored.token_hash !== hashToken(validated)) {
        throw new UnauthorizedError("Refresh token mismatch");
    }

    if (stored.session_id !== sid) {
        throw new UnauthorizedError("Malformed refresh token");
    }

    const session = await accessDAO.findSessionById(sid);
    if (!session || session.revoked_at !== null) {
        throw new UnauthorizedError("Session has been revoked");
    }
    if (session.user_id !== userId) {
        throw new UnauthorizedError("Malformed refresh token");
    }

    // Reject if the user has been soft-deleted since the token was issued
    let user;
    try {
        user = await accountDAO.findById(userId);
    } catch (err) {
        if (err instanceof NotFoundError) {
            throw new ForbiddenError("User account no longer exists");
        }
        throw err;
    }

    const {
        accessToken,
        refreshToken: newRefreshToken,
        accessJti,
        refreshRecord,
    } = buildTokenPair({ userId: user.user_id, role: user.role, sid });

    // Rotate the refresh token and advance the session's current access jti.
    try {
        await accessDAO.rotateSessionTokens({
            sessionId: sid,
            accessJti,
            previousRefreshJti: jti,
            refreshRecord,
            ipAddress,
            userAgent,
            deviceLabel: parseDeviceLabel(userAgent),
        });
    } catch (err) {
        if (err instanceof NotFoundError) {
            throw new UnauthorizedError("Refresh token is no longer valid");
        }
        throw err;
    }

    return toTokenPairDTO({
        accessToken,
        refreshToken: newRefreshToken,
    });
}

export { register, login, logout, logoutAllDevices, refreshTokens };
