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
        const [result] = await this._query(
            `INSERT INTO refresh_tokens (jti, user_id, token_hash, expires_at)
             VALUES (?, ?, ?, ?)`,
            [jti, userId, tokenHash, expiresAt],
        );
        return result.insertId;
    }

    /**
     * This method finds a refresh token row by its JWT ID.
     * @param {string} jti
     * @returns {Promise<object|null>}
     * @throws {DatabaseError} On database failures
     */
    async findRefreshTokenByJti(jti) {
        const [rows] = await this._query(
            `SELECT token_id, jti, user_id, token_hash, expires_at, replaced_by, created_at
             FROM refresh_tokens
             WHERE jti = ?`,
            [jti],
        );
        return rows[0] ?? null;
    }

    /**
     * This method marks a refresh token as rotated/revoked.
     * @param {string} jti
     * @param {number} replacedByTokenId token_id of the replacement refresh token
     * @returns {Promise<void>}
     * @throws {DatabaseError} On database failures
     */
    async revokeRefreshToken(jti, replacedByTokenId) {
        await this._query(
            `UPDATE refresh_tokens
             SET replaced_by = ?
             WHERE jti = ?`,
            [replacedByTokenId, jti],
        );
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
        await this._query(
            `INSERT INTO token_blocklist (jti, user_id, expires_at, token_type)
             VALUES (?, ?, ?, ?)`,
            [jti, userId, expiresAt, tokenType],
        );
    }

    /**
     * This method checks whether a JWT has been blocklisted.
     * @param {string} jti
     * @returns {Promise<boolean>}
     * @throws {DatabaseError} On database failures
     */
    async isBlocklisted(jti) {
        const [rows] = await this._query(
            `SELECT 1 FROM token_blocklist WHERE jti = ? LIMIT 1`,
            [jti],
        );
        return rows.length > 0;
    }
}

export default new TokenDAO();
