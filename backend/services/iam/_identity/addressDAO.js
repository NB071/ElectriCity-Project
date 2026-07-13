// IAM Identity Management
// DAO for addresses table

import BaseDAO from "../../../utils/BaseDAO.js";
import { NotFoundError } from "../../../utils/errors.js";

const ADDRESS_COLUMNS = `
    address_id, user_id, street, city, province, country, postal_code,
    is_default, created_at, updated_at
`;

/**
 * This class is used to interact with the addresses table (a user's saved shipping/billing addresses).
 * @class
 * @extends BaseDAO
 */
class AddressDAO extends BaseDAO {
    /**
     * This constructor calls the constructor of the BaseDAO class.
     * @constructor
     */
    constructor() {
        super();
    }

    // #########################
    // Read operations
    // #########################

    /**
     * This method counts saved addresses for a user.
     * @param {number} user_id
     * @returns {Promise<number>}
     * @throws {DatabaseError} On database failures
     */
    async countByUserId(user_id) {
        const [rows] = await this._query(
            `SELECT COUNT(*) AS total FROM addresses WHERE user_id = ?`,
            [user_id],
        );
        return Number(rows[0].total);
    }

    /**
     * This method returns paginated saved addresses for a user, default address first.
     * @param {number} user_id
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findByUserId(user_id, limit, offset) {
        const safeLimit = Number(limit);
        const safeOffset = Number(offset);

        const [rows] = await this._query(
            `SELECT ${ADDRESS_COLUMNS}
             FROM addresses
             WHERE user_id = ?
             ORDER BY is_default DESC, created_at DESC
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            [user_id],
            { suppressNotFound: true },
        );
        return rows;
    }

    /**
     * This method finds one address, scoped to its owning user.
     * @param {number} address_id
     * @param {number} user_id
     * @returns {Promise<object>}
     * @throws {NotFoundError} If the address does not exist or does not belong to the user
     * @throws {DatabaseError} On database failures
     */
    async findByIdForUser(address_id, user_id) {
        const [rows] = await this._query(
            `SELECT ${ADDRESS_COLUMNS}
             FROM addresses
             WHERE address_id = ? AND user_id = ?`,
            [address_id, user_id],
            { notFoundResource: "Address" },
        );
        return rows[0];
    }

    // #########################
    // Write operations
    // #########################

    /**
     * This method creates a saved address for a user. When marked default, any existing
     * default address for the user is cleared first, in the same transaction.
     * @param {object} data
     * @param {number} data.user_id
     * @param {string} data.street
     * @param {string} data.city
     * @param {string} data.province
     * @param {string} data.country
     * @param {string} data.postal_code
     * @param {boolean} [data.is_default=false]
     * @returns {Promise<object>} The created address
     * @throws {DatabaseError} On database failures
     */
    async insert({
        user_id,
        street,
        city,
        province,
        country,
        postal_code,
        is_default = false,
    }) {
        return this._transaction(async (conn, _queryOptions) => {
            if (is_default) {
                await conn.execute(
                    `UPDATE addresses SET is_default = FALSE WHERE user_id = ?`,
                    [user_id],
                );
            }

            const [result] = await conn.execute(
                `INSERT INTO addresses (user_id, street, city, province, country, postal_code, is_default)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    user_id,
                    street,
                    city,
                    province,
                    country,
                    postal_code,
                    is_default,
                ],
            );

            const [rows] = await conn.execute(
                `SELECT ${ADDRESS_COLUMNS}
                 FROM addresses
                 WHERE address_id = ?`,
                [result.insertId],
            );

            return rows[0];
        });
    }

    /**
     * This method updates a saved address, scoped to its owning user. When setting the
     * address as default, any existing default address for the user is cleared first.
     * @param {number} address_id
     * @param {number} user_id
     * @param {object} updates
     * @param {string} [updates.street]
     * @param {string} [updates.city]
     * @param {string} [updates.province]
     * @param {string} [updates.country]
     * @param {string} [updates.postal_code]
     * @param {boolean} [updates.is_default]
     * @returns {Promise<void>}
     * @throws {NotFoundError} If the address does not exist or does not belong to the user
     * @throws {DatabaseError} On database failures
     */
    async updateById(address_id, user_id, updates) {
        const allowedColumns = [
            "street",
            "city",
            "province",
            "country",
            "postal_code",
            "is_default",
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

        await this._transaction(async (conn, _queryOptions) => {
            if (updates.is_default === true) {
                await conn.execute(
                    `UPDATE addresses SET is_default = FALSE WHERE user_id = ?`,
                    [user_id],
                );
            }

            const [result] = await conn.execute(
                `UPDATE addresses
                 SET ${sets.join(", ")}
                 WHERE address_id = ? AND user_id = ?`,
                [...params, address_id, user_id],
            );

            if (result.affectedRows === 0) {
                throw new NotFoundError("Address");
            }
        });
    }

    /**
     * This method deletes a saved address, scoped to its owning user.
     * @param {number} address_id
     * @param {number} user_id
     * @returns {Promise<void>}
     * @throws {NotFoundError} If the address does not exist or does not belong to the user
     * @throws {DatabaseError} On database failures
     */
    async deleteById(address_id, user_id) {
        await this._query(
            `DELETE FROM addresses WHERE address_id = ? AND user_id = ?`,
            [address_id, user_id],
            { notFoundResource: "Address" },
        );
    }

    /**
     * This method marks one address as the user's default, clearing any previous default.
     * @param {number} address_id
     * @param {number} user_id
     * @returns {Promise<void>}
     * @throws {NotFoundError} If the address does not exist or does not belong to the user
     * @throws {DatabaseError} On database failures
     */
    async setDefault(address_id, user_id) {
        await this._transaction(async (conn, _queryOptions) => {
            await conn.execute(
                `UPDATE addresses SET is_default = FALSE WHERE user_id = ?`,
                [user_id],
            );

            const [result] = await conn.execute(
                `UPDATE addresses SET is_default = TRUE WHERE address_id = ? AND user_id = ?`,
                [address_id, user_id],
            );

            if (result.affectedRows === 0) {
                throw new NotFoundError("Address");
            }
        });
    }
}

const addressDAO = new AddressDAO();
export default addressDAO;
