import BaseDAO from "../../../utils/BaseDAO.js";

class ConfigurationsDAO extends BaseDAO {
    /**
     * This method fetches a configuration by its ID.
     * @param {number} configId
     * @returns {Promise<object>}
     * @throws {NotFoundError} If the configuration does not exist
     * @throws {DatabaseError} On database failures
     */
    async findById(configId) {
        const [rows] = await this._query(
            `SELECT config_id, cid, total_price, created_at
             FROM configurations
             WHERE config_id = ?`,
            [configId],
            { notFoundResource: "Configuration" },
        );
        return rows[0];
    }

    /**
     * This method fetches the options for a given configuration.
     * @param {number} configId
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findOptionsByConfigId(configId) {
        const [rows] = await this._query(
            `SELECT
                co.option_id,
                ov.name AS option_name,
                ov.price_delta,
                oc.category_id,
                oc.name AS category_name,
                oc.select_type
             FROM config_options co
             JOIN option_values ov ON ov.option_id = co.option_id
             JOIN option_categories oc ON oc.category_id = ov.category_id
             WHERE co.config_id = ?
             ORDER BY oc.category_id ASC, ov.name ASC`,
            [configId],
            { suppressNotFound: true },
        );
        return rows;
    }

    /**
     * This method inserts a new configuration.
     * @param {object} input
     * @param {number} input.cid
     * @param {number} input.total_price
     * @param {number[]} input.option_ids
     * @returns {Promise<number>}
     * @throws {ConflictError} If the configuration already exists
     * @throws {DatabaseError} On database failures
     */
    async insertConfiguration({ cid, total_price, option_ids }) {
        return this._transaction(async (conn, _queryOptions) => {
            const [result] = await conn.execute(
                `INSERT INTO configurations (cid, total_price) VALUES (?, ?)`,
                [cid, total_price],
            );

            const configId = result.insertId;

            for (const optionId of option_ids) {
                await conn.execute(
                    `INSERT INTO config_options (config_id, option_id) VALUES (?, ?)`,
                    [configId, optionId],
                );
            }

            return configId;
        });
    }
}

const configurationsDAO = new ConfigurationsDAO();
export default configurationsDAO;
