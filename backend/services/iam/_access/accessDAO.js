// IAM Access Management
// Data access for sessions and refresh tokens.

import BaseDAO from "../../../utils/BaseDAO.js";
import { ConflictError, NotFoundError } from "../../../utils/errors.js";

/**
 * This class handles session records and refresh token storage/rotation.
 * @touches_tables: sessions, refresh_tokens
 * @class
 * @extends BaseDAO
 */
class AccessDAO extends BaseDAO {
  // #########################
  // Session - Read operations
  // #########################

  /**
   * This method finds a session by its id.
   * @param {string} sessionId
   * @returns {Promise<object|null>}
   * @throws {DatabaseError} On database failures
   */
  async findSessionById(sessionId) {
    const [rows] = await this._query(
      `SELECT session_id, user_id, current_access_jti, revoked_at,
                    last_seen_at, created_at
             FROM sessions
             WHERE session_id = ?`,
      [sessionId],
    );
    return rows[0] ?? null;
  }

  /**
   * This method lists active sessions for a user. A session is active when it
   * is not revoked and still has a valid (non-replaced, unexpired) refresh token.
   * @param {number} userId
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findActiveSessionsByUserId(userId) {
    const [rows] = await this._query(
      `SELECT s.session_id, s.device_label, s.ip_address, s.user_agent,
                    s.last_seen_at, s.created_at
             FROM sessions s
             WHERE s.user_id = ?
               AND s.revoked_at IS NULL
               AND EXISTS (
                   SELECT 1
                   FROM refresh_tokens rt
                   WHERE rt.session_id = s.session_id
                     AND rt.replaced_by IS NULL
                     AND rt.expires_at > NOW()
               )
             ORDER BY s.last_seen_at DESC`,
      [userId],
    );
    return rows;
  }

  // #########################
  // Session - Write operations
  // #########################

  /**
   * This method atomically creates a session and its first refresh token.
   * @param {object} data
   * @param {object} data.session
   * @param {string} data.session.sessionId
   * @param {number} data.session.userId
   * @param {string} data.session.accessJti Current access token jti
   * @param {string|null} [data.session.ipAddress]
   * @param {string|null} [data.session.userAgent]
   * @param {string|null} [data.session.deviceLabel]
   * @param {object} data.refreshRecord Refresh token to persist
   * @param {string} data.refreshRecord.jti
   * @param {string} data.refreshRecord.sessionId
   * @param {number} data.refreshRecord.userId
   * @param {string} data.refreshRecord.tokenHash
   * @param {Date|string} data.refreshRecord.expiresAt
   * @returns {Promise<void>}
   * @throws {DatabaseError} On database failures
   * @throws {ConflictError} If the session or refresh token already exists
   */
  async createSessionWithRefreshToken({ session, refreshRecord }) {
    const { sessionId, userId, accessJti, ipAddress, userAgent, deviceLabel } =
      session;

    await this._transaction(async (conn) => {
      try {
        await conn.execute(
          `INSERT INTO sessions
                        (session_id, user_id, current_access_jti, ip_address, user_agent, device_label)
                     VALUES (?, ?, ?, ?, ?, ?)`,
          [
            sessionId,
            userId,
            accessJti,
            ipAddress ?? null,
            userAgent ?? null,
            deviceLabel ?? null,
          ],
        );

        await conn.execute(
          `INSERT INTO refresh_tokens (jti, session_id, user_id, token_hash, expires_at)
                     VALUES (?, ?, ?, ?, ?)`,
          [
            refreshRecord.jti,
            refreshRecord.sessionId,
            refreshRecord.userId,
            refreshRecord.tokenHash,
            refreshRecord.expiresAt,
          ],
        );
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          throw new ConflictError("Session or refresh token already exists", {
            sessionId,
            refreshJti: refreshRecord.jti,
          });
        }
        throw err;
      }
    });
  }

  /**
   * This method atomically rotates a session's tokens: it inserts the new
   * refresh token, marks the previous one as replaced, and updates the session's
   * current access jti. Session visibility metadata (ip_address, user_agent,
   * device_label) is refreshed when new values are supplied; passing null keeps
   * the existing value so a request without those headers won't wipe them.
   * @param {object} data
   * @param {string} data.sessionId
   * @param {string} data.accessJti New access token jti
   * @param {string} data.previousRefreshJti jti of the refresh token being rotated out
   * @param {object} data.refreshRecord New refresh token to persist
   * @param {string} data.refreshRecord.jti
   * @param {string} data.refreshRecord.sessionId
   * @param {number} data.refreshRecord.userId
   * @param {string} data.refreshRecord.tokenHash
   * @param {Date|string} data.refreshRecord.expiresAt
   * @param {string|null} [data.ipAddress] Request IP to refresh on the session
   * @param {string|null} [data.userAgent] Request user agent to refresh on the session
   * @param {string|null} [data.deviceLabel] Parsed device label to refresh on the session
   * @returns {Promise<void>}
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If the previous refresh token or session is missing, replaced, or revoked
   */
  async rotateSessionTokens({
    sessionId,
    accessJti,
    previousRefreshJti,
    refreshRecord,
    ipAddress = null,
    userAgent = null,
    deviceLabel = null,
  }) {
    await this._transaction(async (conn) => {
      try {
        const [insertResult] = await conn.execute(
          `INSERT INTO refresh_tokens (jti, session_id, user_id, token_hash, expires_at)
                     VALUES (?, ?, ?, ?, ?)`,
          [
            refreshRecord.jti,
            refreshRecord.sessionId,
            refreshRecord.userId,
            refreshRecord.tokenHash,
            refreshRecord.expiresAt,
          ],
        );
        const newTokenId = insertResult.insertId;

        const [updateResult] = await conn.execute(
          `UPDATE refresh_tokens
                     SET replaced_by = ?
                     WHERE jti = ? AND replaced_by IS NULL`,
          [newTokenId, previousRefreshJti],
        );

        if (updateResult.affectedRows === 0) {
          throw new NotFoundError("Refresh token");
        }

        const [sessionResult] = await conn.execute(
          `UPDATE sessions
                     SET current_access_jti = ?,
                         last_seen_at = CURRENT_TIMESTAMP,
                         ip_address = COALESCE(?, ip_address),
                         user_agent = COALESCE(?, user_agent),
                         device_label = COALESCE(?, device_label)
                     WHERE session_id = ? AND revoked_at IS NULL`,
          [accessJti, ipAddress, userAgent, deviceLabel, sessionId],
        );

        if (sessionResult.affectedRows === 0) {
          throw new NotFoundError("Session");
        }
      } catch (err) {
        if (err instanceof NotFoundError) {
          throw err;
        }
        if (err.code === "ER_DUP_ENTRY") {
          throw new ConflictError("Refresh token already exists", {
            jti: refreshRecord.jti,
          });
        }
        throw err;
      }
    });
  }

  /**
   * This method atomically revokes a single session and deletes its refresh tokens (per-device logout)
   * @param {string} sessionId
   * @returns {Promise<void>}
   * @throws {DatabaseError} On database failures
   * @throws {ConflictError} On unexpected constraint conflicts
   */
  async endSession(sessionId) {
    await this._transaction(async (conn) => {
      try {
        await conn.execute(
          `UPDATE sessions
                     SET revoked_at = CURRENT_TIMESTAMP
                     WHERE session_id = ? AND revoked_at IS NULL`,
          [sessionId],
        );

        await conn.execute(`DELETE FROM refresh_tokens WHERE session_id = ?`, [
          sessionId,
        ]);
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          throw new ConflictError("Session could not be ended", {
            sessionId,
          });
        }
        throw err;
      }
    });
  }

  /**
   * This method atomically revokes all of a user's active sessions and deletes
   * all of their refresh tokens (global sign-out on all devices).
   * @param {number} userId
   * @returns {Promise<void>}
   * @throws {DatabaseError} On database failures
   * @throws {ConflictError} On unexpected constraint conflicts
   */
  async endAllSessionsByUserId(userId) {
    await this._transaction(async (conn) => {
      try {
        await conn.execute(
          `UPDATE sessions
                     SET revoked_at = CURRENT_TIMESTAMP
                     WHERE user_id = ? AND revoked_at IS NULL`,
          [userId],
        );

        await conn.execute(`DELETE FROM refresh_tokens WHERE user_id = ?`, [
          userId,
        ]);
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          throw new ConflictError("User sessions could not be ended", {
            userId,
          });
        }
        throw err;
      }
    });
  }

  // #########################
  // Refresh token - Read operations
  // #########################

  /**
   * This method finds a refresh token row by its JWT ID.
   * @param {string} jti
   * @returns {Promise<object|null>}
   * @throws {DatabaseError} On database failures
   */
  async findRefreshTokenByJti(jti) {
    const [rows] = await this._query(
      `SELECT token_id, jti, session_id, user_id, token_hash, expires_at, replaced_by, created_at
             FROM refresh_tokens
             WHERE jti = ?`,
      [jti],
    );
    return rows[0] ?? null;
  }
}

export default new AccessDAO();
