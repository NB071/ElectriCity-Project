// IAM Access Management
// Token persistence (refresh_tokens, token_blocklist)

import BaseDAO from "../../../utils/BaseDAO.js";

/**
 * This class handles refresh token storage and JWT blocklisting.
 * @class
 * @extends {BaseDAO}
 */
class TokenDAO extends BaseDAO {
    // #########################
    // Refresh token operations
    // #########################

    /**
     * This method persists a new refresh token record.
     * @param {object} data
     * @param {string} data.jti
     * @param {number} data.userId
     * @param {string} data.tokenHash SHA-256 hash of the raw refresh token
     * @param {Date|string} data.expiresAt
     * @returns {Promise<number>} Inserted token_id
     * @throws {DatabaseError} On database failures
     */
    async insertRefreshToken({ jti, userId, tokenHash, expiresAt }) {
        void jti;
        void userId;
        void tokenHash;
        void expiresAt;
        throw new Error("Not implemented");
    }

    /**
     * This method finds a refresh token row by its JWT ID.
     * @param {string} jti
     * @returns {Promise<object|null>}
     * @throws {DatabaseError} On database failures
     */
    async findRefreshTokenByJti(jti) {
        void jti;
        throw new Error("Not implemented");
    }

    /**
     * This method marks a refresh token as rotated/revoked.
     * @param {string} jti
     * @param {number} replacedByTokenId token_id of the replacement refresh token
     * @returns {Promise<void>}
     * @throws {DatabaseError} On database failures
     */
    async revokeRefreshToken(jti, replacedByTokenId) {
        void jti;
        void replacedByTokenId;
        throw new Error("Not implemented");
    }

    // #########################
    // Token blocklist operations
    // #########################

    /**
     * This method blocklists a JWT by jti (used on logout).
     * @param {object} data
     * @param {string} data.jti
     * @param {number} data.userId
     * @param {Date|string} data.expiresAt Token natural expiry (for cleanup)
     * @param {string} data.tokenType "access" | "refresh"
     * @returns {Promise<void>}
     * @throws {DatabaseError} On database failures
     */
    async blocklistToken({ jti, userId, expiresAt, tokenType }) {
        void jti;
        void userId;
        void expiresAt;
        void tokenType;
        throw new Error("Not implemented");
    }

    /**
     * This method checks whether a JWT has been blocklisted.
     * @param {string} jti
     * @returns {Promise<boolean>}
     * @throws {DatabaseError} On database failures
     */
    async isBlocklisted(jti) {
        void jti;
        throw new Error("Not implemented");
    }
}

export default new TokenDAO();
