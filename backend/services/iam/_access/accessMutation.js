// IAM Access Management
// CQRS - Mutations

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import tokenDAO from "./tokenDAO.js";
import accountDAO from "../_identity/accountDAO.js";
import {
    validateRegisterInput,
    validateLoginInput,
    validateRefreshTokenInput,
    validateLogoutContext,
} from "./accessValidator.js";
import { TOKEN_TYPES, JWT } from "./constants.js";
import env from "../../../configs/env.js";
import {
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
} from "../../../utils/errors.js";

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Generates a unique JWT ID (jti). Matches CHAR(36) columns and VALIDATIONS.JTI.LENGTH.
 * @returns {string}
 */
function generateJti() {
    return crypto.randomUUID();
}

/**
 * SHA-256 hashes a raw token for at-rest storage (refresh_tokens.token_hash CHAR(64)).
 * @param {string} rawToken
 * @returns {string} 64-char hex digest
 */
function hashToken(rawToken) {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Signs a short-lived access JWT carrying user_id + role claims.
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.role
 * @param {string} data.jti
 * @returns {string}
 */
function signAccessToken({ userId, role, jti }) {
    return jwt.sign({ user_id: userId, role }, env.jwt.JWT_SIGN_KEY, {
        algorithm: JWT.ALGORITHM,
        issuer: JWT.ISSUER,
        expiresIn: JWT.ACCESS_EXPIRY,
        jwtid: jti,
    });
}

/**
 * Signs a long-lived refresh JWT.
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.jti
 * @returns {string}
 */
function signRefreshToken({ userId, jti }) {
    return jwt.sign({ user_id: userId }, env.jwt.JWT_SIGN_KEY, {
        algorithm: JWT.ALGORITHM,
        issuer: JWT.ISSUER,
        expiresIn: JWT.REFRESH_EXPIRY,
        jwtid: jti,
    });
}

/**
 * Issues a fresh access + refresh token pair and persists the refresh token.
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.role
 * @returns {Promise<{ accessToken: string, refreshToken: string, tokenId: number }>}
 */
async function issueTokenPair({ userId, role }) {
    const accessToken = signAccessToken({ userId, role, jti: generateJti() });

    const refreshJti = generateJti();
    const refreshToken = signRefreshToken({ userId, jti: refreshJti });
    const { exp } = jwt.decode(refreshToken);

    const tokenId = await tokenDAO.insertRefreshToken({
        jti: refreshJti,
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(exp * 1000),
    });

    return { accessToken, refreshToken, tokenId };
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
        BCRYPT_SALT_ROUNDS,
    );

    return accountDAO.create({
        firstName: validated.firstName,
        lastName: validated.lastName,
        email: validated.email,
        passwordHash,
        phoneNumber: validated.phoneNumber ?? null,
    });
}

/**
 * This function authenticates credentials and issues access + refresh JWTs.
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.password
 * @returns {Promise<object>} { accessToken, refreshToken, user }
 * @throws {ValidationError} If validation fails
 * @throws {UnauthorizedError} If credentials are invalid
 * @throws {DatabaseError} If a database operation fails
 */
async function login({ email, password }) {
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

    const { accessToken, refreshToken } = await issueTokenPair({
        userId: user.user_id,
        role: user.role,
    });

    return {
        accessToken,
        refreshToken,
        user: {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
        },
    };
}

/**
 * This function blocklists the current JWT and revokes its refresh token chain on logout.
 * userId and jti must come from the authenticated access token (req.user)
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.jti Access token JWT ID
 * @param {string} data.tokenExpiry ISO date or Date from token claims
 * @returns {Promise<void>}
 * @throws {ValidationError} If validation fails or blocklist insert fails
 * @throws {DatabaseError} If blocklist insert fails
 */
async function logout({ userId, jti, tokenExpiry }) {
    const validated = validateLogoutContext({
        userId,
        jti,
        tokenType: TOKEN_TYPES.ACCESS,
    });

    const expiresAt =
        tokenExpiry instanceof Date
            ? tokenExpiry
            : new Date(Number(tokenExpiry) * 1000);

    await tokenDAO.blocklistToken({
        jti: validated.jti,
        userId: validated.userId,
        expiresAt,
        tokenType: TOKEN_TYPES.ACCESS,
    });
}

/**
 * This function rotates refresh tokens and issues a new access token.
 * @param {string} refreshToken Raw refresh JWT from body or cookie
 * @returns {Promise<object>} { accessToken, refreshToken }
 * @throws {ValidationError} If validation fails
 * @throws {UnauthorizedError} If token is invalid, expired, revoked, or replaced
 * @throws {ForbiddenError} If the user no longer exists
 */
async function refreshTokens(refreshToken) {
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

    const { user_id: userId, jti } = payload;
    if (!userId || !jti) {
        throw new UnauthorizedError("Malformed refresh token");
    }

    if (await tokenDAO.isBlocklisted(jti)) {
        throw new UnauthorizedError("Refresh token has been revoked");
    }

    const stored = await tokenDAO.findRefreshTokenByJti(jti);
    if (!stored || stored.replaced_by !== null) {
        throw new UnauthorizedError("Refresh token is no longer valid");
    }

    if (stored.token_hash !== hashToken(validated)) {
        throw new UnauthorizedError("Refresh token mismatch");
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

    const { accessToken, refreshToken: newRefreshToken, tokenId } =
        await issueTokenPair({ userId: user.user_id, role: user.role });

    // Mark the old refresh token as rotated (reuse detection)
    await tokenDAO.revokeRefreshToken(jti, tokenId);

    return { accessToken, refreshToken: newRefreshToken };
}

export { register, login, logout, refreshTokens };
