import BaseDAO from "../../../utils/BaseDAO.js";

/**
 * This class is the DAO for the options.
 * @class
 * @extends {BaseDAO}
 */
class OptionsDAO extends BaseDAO {
    /**
     * This method finds the options by the catalog item ID.
     * @param {number} cid
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findByCatalogItemId(cid) {
        const [rows] = await this._query(
            `SELECT
                oc.category_id,
                oc.name AS category_name,
                oc.select_type,
                ov.option_id,
                ov.name AS option_name,
                ov.price_delta
             FROM catalog_options co
             JOIN option_values ov ON ov.option_id = co.option_id
             JOIN option_categories oc ON oc.category_id = ov.category_id
             WHERE co.cid = ?
             ORDER BY oc.category_id ASC, ov.name ASC`,
            [cid],
            { suppressNotFound: true },
        );
        return rows;
    }

    /**
     * This method finds the options by the option IDs.
     * @param {number[]} optionIds
     * @returns {Promise<object[]>}
     * @throws {NotFoundError} If the options do not exist
     * @throws {DatabaseError} On database failures
     */
    async findOptionsByIds(optionIds) {
        if (!optionIds.length) {
            return [];
        }

        const placeholders = optionIds.map(() => "?").join(", ");
        const [rows] = await this._query(
            `SELECT
                ov.option_id,
                ov.category_id,
                ov.name,
                ov.price_delta,
                oc.name AS category_name,
                oc.select_type
             FROM option_values ov
             JOIN option_categories oc ON oc.category_id = ov.category_id
             WHERE ov.option_id IN (${placeholders})`,
            optionIds,
            { notFoundResource: "Options" },
        );
        return rows;
    }

    /**
     * This method finds the catalog options for the item.
     * @param {number} cid
     * @param {number[]} optionIds
     * @returns {Promise<object[]>}
     * @throws {DatabaseError} On database failures
     */
    async findCatalogOptionsForItem(cid, optionIds) {
        if (!optionIds.length) {
            return [];
        }

        const placeholders = optionIds.map(() => "?").join(", ");
        const [rows] = await this._query(
            `SELECT co.option_id
             FROM catalog_options co
             WHERE co.cid = ?
               AND co.option_id IN (${placeholders})`,
            [cid, ...optionIds],
            { suppressNotFound: true },
        );
        return rows;
    }
}

const optionsDAO = new OptionsDAO();
export default optionsDAO;
