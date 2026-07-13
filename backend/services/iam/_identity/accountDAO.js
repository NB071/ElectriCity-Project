// IAM Identity Management
// DAO for users table

import BaseDAO from "../../../utils/BaseDAO.js";
import { NotFoundError, ValidationError } from "../../../utils/errors.js";
import { DEFAULTS, VALIDATIONS, USER_FIELDS } from "./constants.js";
import { ROLES } from "../_access/constants.js";

/**
 * This class is used to interact with the users table.
 * @class
 * @extends BaseDAO
 */
class AccountDAO extends BaseDAO {
    /**
     * This private method resolves validated field names to SQL select parts.
     * @private
     * @param {string[]} fields
     * @returns {{ selectClause: string, needsRoleJoin: boolean }}
     * @throws {ValidationError} If a field is not selectable
     */
    #resolveSelectClause(fields) {
        const selectParts = [];
        let needsRoleJoin = false;

        for (const field of fields) {
            if (!VALIDATIONS.SELECTABLE_FIELDS.includes(field)) {
                throw new ValidationError(`Unsupported user field: ${field}`);
            }

            if (field === VALIDATIONS.USER_FIELDS.ROLE) {
                selectParts.push("r.role_name AS role");
                needsRoleJoin = true;
            } else {
                selectParts.push(`u.${field}`);
            }
        }

        return {
            selectClause: selectParts.join(", "),
            needsRoleJoin,
        };
    }

    /**
     * This private method builds the admin user search WHERE clause.
     * @private
     * @param {string} searchTerm
     * @returns {{ whereClause: string, params: unknown[] }}
     */
    #buildAdminSearchClause(searchTerm) {
        // normalize the search term
        const normalizedTerm = searchTerm.trim().toLowerCase();

        // if the search term is deleted, return the where clause for deleted users
        if (
            VALIDATIONS.DELETED_SEARCH_KEYWORDS.DELETED.includes(normalizedTerm)
        ) {
            return { whereClause: "u.deleted_at IS NOT NULL", params: [] };
        }

        // if the search term is active, return the where clause for active users
        if (
            VALIDATIONS.DELETED_SEARCH_KEYWORDS.ACTIVE.includes(normalizedTerm)
        ) {
            return { whereClause: "u.deleted_at IS NULL", params: [] };
        }

        // build the like term for the search
        const likeTerm = `%${searchTerm}%`;
        const params = Array(8).fill(likeTerm);

        // build the where clause for the search
        const whereClause = `(
            u.first_name LIKE ?
            OR u.last_name LIKE ?
            OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?
            OR u.email LIKE ?
            OR COALESCE(u.phone_number, '') LIKE ?
            OR r.role_name LIKE ?
            OR DATE_FORMAT(u.created_at, '%Y-%m-%d') LIKE ?
            OR DATE_FORMAT(u.created_at, '%Y-%m-%d %H:%i:%s') LIKE ?
        )`;

        return { whereClause, params };
    }

    // #########################
    // Read operations
    // #########################

    /**
     * This method finds an active user by id with optional field projection.
     * @param {number} userId
     * @param {string[]} [fields] Subset of VALIDATIONS.SELECTABLE_FIELDS; defaults to full profile
     * @returns {Promise<object>}
     * @throws {NotFoundError} If the user does not exist or is soft-deleted
     * @throws {DatabaseError} On database failures
     */
    async findById(userId, fields = DEFAULTS.PROFILE_FIELDS) {
        const requestedFields =
            fields.length > 0 ? fields : DEFAULTS.PROFILE_FIELDS;
        const { selectClause, needsRoleJoin } =
            this.#resolveSelectClause(requestedFields);

        const joinClause = needsRoleJoin
            ? "JOIN roles r ON r.role_id = u.role_id"
            : "";

        const [rows] = await this._query(
            `SELECT ${selectClause}
             FROM users u
             ${joinClause}
             WHERE u.user_id = ? AND u.deleted_at IS NULL`,
            [userId],
            { notFoundResource: "User" },
        );

        return rows[0];
    }

    /**
     * This method returns the password hash for an active user.
     * @param {number} userId
     * @returns {Promise<string>}
     * @throws {NotFoundError} If the user does not exist or is soft-deleted
     * @throws {DatabaseError} On database failures
     */
    async findPasswordHashById(userId) {
        const [rows] = await this._query(
            `SELECT password_hash
             FROM users
             WHERE user_id = ? AND deleted_at IS NULL`,
            [userId],
            { notFoundResource: "User" },
        );

        return rows[0].password_hash;
    }

    /**
     * This method counts all platform users including soft-deleted accounts.
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countAllUsers() {
        const [rows] = await this._query(
            `SELECT COUNT(*) AS total FROM users u`,
        );
        return rows[0].total;
    }

    /**
     * This method returns a paginated admin list of all platform users.
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findAllUsers(limit, offset) {
        const safeLimit = Number(limit);
        const safeOffset = Number(offset);

        const [rows] = await this._query(
            `SELECT
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone_number,
                u.deleted_at,
                u.created_at,
                r.role_name AS role
             FROM users u
             JOIN roles r ON r.role_id = u.role_id
             ORDER BY u.created_at DESC
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            [],
            { suppressNotFound: true },
        );

        return rows;
    }

    /**
     * This method counts users matching an admin search term.
     * @param {string} searchTerm
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countSearchUsers(searchTerm) {
        const { whereClause, params } =
            this.#buildAdminSearchClause(searchTerm);

        const [rows] = await this._query(
            `SELECT COUNT(*) AS total
             FROM users u
             JOIN roles r ON r.role_id = u.role_id
             WHERE ${whereClause}`,
            params,
        );

        return rows[0].total;
    }

    /**
     * This method returns a paginated admin search result for platform users.
     * @param {string} searchTerm
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async searchUsers(searchTerm, limit, offset) {
        const { whereClause, params } =
            this.#buildAdminSearchClause(searchTerm);
        const safeLimit = Number(limit);
        const safeOffset = Number(offset);

        const [rows] = await this._query(
            `SELECT
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone_number,
                u.deleted_at,
                u.created_at,
                r.role_name AS role
             FROM users u
             JOIN roles r ON r.role_id = u.role_id
             WHERE ${whereClause}
             ORDER BY u.created_at DESC
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            params,
            { suppressNotFound: true },
        );

        return rows;
    }

    /**
     * This method checks whether an email is already used by another active user.
     * @param {string} email
     * @param {number|null} [excludeUserId]
     * @returns {Promise<boolean>}
     * @throws {DatabaseError} On database failures
     */
    async emailExists(email, excludeUserId = null) {
        const sql = excludeUserId
            ? `SELECT 1 AS found
               FROM users
               WHERE email = ? AND user_id != ? AND deleted_at IS NULL
               LIMIT 1`
            : `SELECT 1 AS found
               FROM users
               WHERE email = ? AND deleted_at IS NULL
               LIMIT 1`;

        const params = excludeUserId ? [email, excludeUserId] : [email];
        const [rows] = await this._query(sql, params, {
            suppressNotFound: true,
        });

        return rows.length > 0;
    }

    /**
     * This method finds an active user by email, including the password hash for login.
     * @param {string} email
     * @returns {Promise<object|null>} { user_id, first_name, last_name, email, password_hash, role } or null
     * @throws {DatabaseError} On database failures
     */
    async findByEmail(email) {
        const [rows] = await this._query(
            `SELECT
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.password_hash,
                r.role_name AS role
             FROM users u
             JOIN roles r ON r.role_id = u.role_id
             WHERE u.email = ? AND u.deleted_at IS NULL
             LIMIT 1`,
            [email],
            { suppressNotFound: true },
        );

        return rows[0] ?? null;
    }

    // #########################
    // Write operations
    // #########################

    /**
     * This method creates a new user with the default customer role.
     * @param {object} data
     * @param {string} data.firstName
     * @param {string} data.lastName
     * @param {string} data.email
     * @param {string} data.passwordHash bcrypt hash of the user's password
     * @param {string|null} [data.phoneNumber]
     * @returns {Promise<object>} Safe created-user profile (no password fields)
     * @throws {ConflictError} If the email is already registered
     * @throws {DatabaseError} On database failures
     */
    async create({
        firstName,
        lastName,
        email,
        passwordHash,
        phoneNumber = null,
    }) {
        const [result] = await this._query(
            `INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone_number)
             VALUES ((SELECT role_id FROM roles WHERE role_name = ?), ?, ?, ?, ?, ?)`,
            [
                ROLES.CUSTOMER,
                firstName,
                lastName,
                email,
                passwordHash,
                phoneNumber,
            ],
            {
                conflictMessage: "Email is already registered.",
                conflictDetails: { email },
            },
        );

        return this.findById(result.insertId);
    }

    /**
     * This method updates profile columns for an active user.
     * @param {number} userId
     * @param {object} updates
     * @param {string} [updates.first_name]
     * @param {string} [updates.last_name]
     * @param {string} [updates.email]
     * @param {string|null} [updates.phone_number]
     * @param {string} [updates.password_hash]
     * @returns {Promise<void>}
     * @throws {NotFoundError} If the user does not exist or is soft-deleted
     * @throws {ConflictError} If the email is already taken
     * @throws {DatabaseError} On database failures
     */
    async updateById(userId, updates) {
        const allowedColumns = [
            USER_FIELDS.FIRST_NAME,
            USER_FIELDS.LAST_NAME,
            USER_FIELDS.EMAIL,
            USER_FIELDS.PHONE_NUMBER,
            "password_hash",
        ];
        const sets = [];
        const params = [];

        for (const [column, value] of Object.entries(updates)) {
            if (value !== undefined && allowedColumns.includes(column)) {
                sets.push(`${column} = ?`);
                params.push(value);
            }
        }

        if (sets.length === 0) {
            return;
        }

        params.push(userId);

        await this._query(
            `UPDATE users
             SET ${sets.join(", ")}
             WHERE user_id = ? AND deleted_at IS NULL`,
            params,
            {
                notFoundResource: "User",
                conflictMessage:
                    "Email is already registered to another account.",
                conflictDetails: { email: updates.email },
            },
        );
    }

    /**
     * This method soft-deletes a user and tears down their sessions and refresh tokens.
     * @param {number} userId
     * @returns {Promise<void>}
     * @throws {NotFoundError} If the user does not exist or is already deleted
     * @throws {DatabaseError} On database failures
     */
    async softDeleteById(userId) {
        await this._transaction(async (conn) => {
            // placeholder is bounded length: deleted_<id>_<unix>@deleted.local
            const [updateResult] = await conn.execute(
                `UPDATE users
                 SET deleted_at = CURRENT_TIMESTAMP,
                     email = CONCAT(
                         'deleted_',
                         user_id,
                         '_',
                         UNIX_TIMESTAMP(),
                         '@deleted.local'
                     )
                 WHERE user_id = ? AND deleted_at IS NULL`,
                [userId],
            );

            if (updateResult.affectedRows === 0) {
                throw new NotFoundError("User");
            }

            await conn.execute(`DELETE FROM refresh_tokens WHERE user_id = ?`, [
                userId,
            ]);

            await conn.execute(`DELETE FROM sessions WHERE user_id = ?`, [
                userId,
            ]);
        });
    }
}

export default new AccountDAO();
