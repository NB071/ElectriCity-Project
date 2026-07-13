import BaseDAO from "../../../utils/BaseDAO.js";
import { ValidationError } from "../../../utils/errors.js";
import { DEFAULTS, ITEM_TYPES } from "../constants.js";
import { getBrowseFilterForPromoType } from "../_promotions/promotionsQuery.js";

class ProductDAO extends BaseDAO {
    #sortClauseMap = {
        price_asc: "ci.base_price ASC",
        price_desc: "ci.base_price DESC",
        year_desc: "v.year DESC",
        year_asc: "v.year ASC",
        mileage_asc: "v.mileage ASC",
        mileage_desc: "v.mileage DESC",
        added_desc: "ci.created_at DESC",
    };

    /**
     * This is the select clause for the vehicle list.
     * @private
     */
    #vehicleListSelect = `
    ci.cid,
    ci.item_type,
    ci.base_price,
    ci.quantity,
    ci.is_active,
    ci.created_at,
    m.model_id,
    m.name AS model_name,
    b.brand_id,
    b.name AS brand_name,
    v.year,
    v.\`condition\`,
    v.mileage,
    vm.body_shape,
    vm.door_count,
    vm.drivetrain
`;

    /**
     * This method builds a query for the vehicle list.
     * @private
     * @param {object} filters
     * @param {string} sort
     * @returns {{ joins: string, where: string, params: unknown[], orderBy: string }}
     * @throws {ValidationError} If the sort is not supported
     */
    #buildVehicleQuery(filters = {}, sort = DEFAULTS.SORT) {
        const params = [];
        const where = ["ci.item_type = ?", "ci.is_active = TRUE"];
        params.push(ITEM_TYPES.VEHICLE);

        if (filters.brand_id != null) {
            where.push("b.brand_id = ?");
            params.push(filters.brand_id);
        }

        if (filters.model_id != null) {
            where.push("m.model_id = ?");
            params.push(filters.model_id);
        }

        if (filters.condition != null) {
            where.push("v.`condition` = ?");
            params.push(filters.condition);
        }

        if (filters.year_min != null) {
            where.push("v.year >= ?");
            params.push(filters.year_min);
        }

        if (filters.year_max != null) {
            where.push("v.year <= ?");
            params.push(filters.year_max);
        }

        if (filters.price_min != null) {
            where.push("ci.base_price >= ?");
            params.push(filters.price_min);
        }

        if (filters.price_max != null) {
            where.push("ci.base_price <= ?");
            params.push(filters.price_max);
        }

        if (filters.mileage_max != null) {
            where.push("v.mileage <= ?");
            params.push(filters.mileage_max);
        }

        if (filters.body_shape != null) {
            where.push("vm.body_shape = ?");
            params.push(filters.body_shape);
        }

        if (filters.drivetrain != null) {
            where.push("vm.drivetrain = ?");
            params.push(filters.drivetrain);
        }

        if (filters.promo != null) {
            const fragment = getBrowseFilterForPromoType(filters.promo);
            where.push(fragment.sql);
            params.push(...fragment.params);
        }

        if (filters.search != null) {
            const pattern = `%${filters.search}%`;
            where.push("(m.name LIKE ? OR b.name LIKE ?)");
            params.push(pattern, pattern);
        }

        const orderBy = this.#sortClauseMap[sort];
        if (!orderBy) {
            throw new ValidationError(`Unsupported sort: ${sort}`);
        }

        return {
            joins: `
                JOIN models m ON m.model_id = ci.model_id
                JOIN brands b ON b.brand_id = m.brand_id
                JOIN vehicles v ON v.cid = ci.cid
                JOIN vehicle_models vm ON vm.model_id = m.model_id
            `,
            where: where.join(" AND "),
            params,
            orderBy,
        };
    }

    /**
     * This method counts the number of vehicles matching the filters.
     * @param {object} filters
     * @param {string} sort
     * @returns {Promise<number>}
     * @throws {ValidationError} If the sort is not supported
     * @throws {DatabaseError} On database failures
     */
    async countVehicles(filters = {}, sort = DEFAULTS.SORT) {
        const query = this.#buildVehicleQuery(filters, sort);
        const [rows] = await this._query(
            `SELECT COUNT(*) AS total
             FROM catalog_items ci
             ${query.joins}
             WHERE ${query.where}`,
            query.params,
        );
        return Number(rows[0].total);
    }

    /**
     * This method finds the vehicles matching the filters.
     * @param {object} filters
     * @param {number} limit
     * @param {number} offset
     * @param {string} sort
     * @returns {Promise<object[]>}
     * @throws {ValidationError} If the sort is not supported
     * @throws {DatabaseError} On database failures
     */
    async findVehicles(filters = {}, limit, offset, sort = DEFAULTS.SORT) {
        const query = this.#buildVehicleQuery(filters, sort);
        const safeLimit = Number(limit);
        const safeOffset = Number(offset);
        const [rows] = await this._query(
            `SELECT ${this.#vehicleListSelect}
             FROM catalog_items ci
             ${query.joins}
             WHERE ${query.where}
             ORDER BY ${query.orderBy}
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            query.params,
        );
        return rows;
    }

    /**
     * This method finds the base catalog item by its ID.
     * @param {number} cid
     * @returns {Promise<object|null>}
     * @throws {NotFoundError} If the catalog item does not exist
     * @throws {DatabaseError} On database failures
     */
    async findBaseById(cid) {
        const [rows] = await this._query(
            `SELECT
                ci.cid,
                ci.model_id,
                ci.item_type,
                ci.base_price,
                ci.quantity,
                ci.is_active,
                ci.created_at,
                ci.updated_at,
                m.name AS model_name,
                m.description AS model_description,
                m.release_year,
                b.brand_id,
                b.name AS brand_name,
                b.country AS brand_country
             FROM catalog_items ci
             JOIN models m ON m.model_id = ci.model_id
             JOIN brands b ON b.brand_id = m.brand_id
             WHERE ci.cid = ?`,
            [cid],
            { notFoundResource: "Catalog item" },
        );
        return rows[0] ?? null;
    }

    /**
     * This method checks whether a catalog item exists by primary key.
     * @param {number} cid
     * @param {object} [options]
     * @param {boolean} [options.requireActive=false] When true, only active items match
     * @returns {Promise<boolean>}
     * @throws {DatabaseError} On database failures
     */
    async existsById(cid, { requireActive = false } = {}) {
        const sql = requireActive
            ? `SELECT 1 AS found FROM catalog_items WHERE cid = ? AND is_active = TRUE LIMIT 1`
            : `SELECT 1 AS found FROM catalog_items WHERE cid = ? LIMIT 1`;
        const [rows] = await this._query(sql, [cid], {
            suppressNotFound: true,
        });
        return rows.length > 0;
    }

    /**
     * This method finds the vehicle by its ID.
     * @param {number} cid
     * @returns {Promise<object|null>}
     * @throws {NotFoundError} If the vehicle does not exist
     * @throws {DatabaseError} On database failures
     */
    async findVehicleById(cid) {
        const [rows] = await this._query(
            `SELECT
                v.cid,
                v.year,
                v.\`condition\`,
                v.mileage,
                vm.body_shape,
                vm.door_count,
                vm.drivetrain
             FROM vehicles v
             JOIN catalog_items ci ON ci.cid = v.cid
             JOIN models m ON m.model_id = ci.model_id
             JOIN vehicle_models vm ON vm.model_id = m.model_id
             WHERE v.cid = ?`,
            [cid],
            { notFoundResource: "Vehicle" },
        );
        return rows[0] ?? null;
    }

    /**
     * This method finds the vehicle history by the catalog item ID.
     * @param {number} cid
     * @returns {Promise<object|null>}
     * @throws {DatabaseError} On database failures
     */
    async findVehicleHistoryByCid(cid) {
        const [rows] = await this._query(
            `SELECT history_id, cid, has_accidents, owners_count, media_id
             FROM vehicle_history
             WHERE cid = ?
             LIMIT 1`,
            [cid],
            { suppressNotFound: true },
        );
        return rows[0] ?? null;
    }

    /**
     * This method finds multiple catalog items by their IDs.
     * @param {number[]} cids
     * @returns {Promise<object[]>}
     * @throws {NotFoundError} If the catalog item does not exist
     * @throws {DatabaseError} On database failures
     */
    async findManyForCompare(cids) {
        if (!cids.length) {
            return [];
        }

        const placeholders = cids.map(() => "?").join(", ");
        const [rows] = await this._query(
            `SELECT ${this.#vehicleListSelect}
             FROM catalog_items ci
             JOIN models m ON m.model_id = ci.model_id
             JOIN brands b ON b.brand_id = m.brand_id
             JOIN vehicles v ON v.cid = ci.cid
             JOIN vehicle_models vm ON vm.model_id = m.model_id
             WHERE ci.cid IN (${placeholders})
             ORDER BY FIELD(ci.cid, ${placeholders})`,
            [...cids, ...cids],
            { notFoundResource: "Catalog item" },
        );
        return rows;
    }
}

const productDAO = new ProductDAO();
export default productDAO;
