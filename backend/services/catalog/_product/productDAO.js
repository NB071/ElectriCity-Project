import BaseDAO from "../../../utils/BaseDAO.js";
import { ValidationError } from "../../../utils/errors.js";
import { DEFAULTS, ITEM_TYPES } from "../constants.js";
import { getBrowseFilterForPromoType } from "../_promotions/promotionsQuery.js";

/**
 * Product DAO layer
 * @touches_tables: catalog_items, models, brands, vehicles, vehicle_models, vehicle_history
 */
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
    v.exterior_color,
    v.interior_color,
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
      // Validator normalizes to an array, but tolerate a single string
      // for direct callers (e.g. chatbot strategies).
      const shapes = Array.isArray(filters.body_shape)
        ? filters.body_shape
        : [filters.body_shape];

      if (shapes.length > 0) {
        const placeholders = shapes.map(() => "?").join(", ");
        where.push(`vm.body_shape IN (${placeholders})`);
        params.push(...shapes);
      }
    }

    if (filters.drivetrain != null) {
      where.push("vm.drivetrain = ?");
      params.push(filters.drivetrain);
    }

    if (filters.exterior_color != null) {
      where.push("v.exterior_color = ?");
      params.push(filters.exterior_color);
    }

    if (filters.interior_color != null) {
      where.push("v.interior_color = ?");
      params.push(filters.interior_color);
    }

    if (filters.promo != null) {
      // Validator normalizes to an array, but tolerate a single string
      // for direct callers (e.g. chatbot strategies).
      const promos = Array.isArray(filters.promo)
        ? filters.promo
        : [filters.promo];

      if (promos.length === 1) {
        const fragment = getBrowseFilterForPromoType(promos[0]);
        where.push(fragment.sql);
        params.push(...fragment.params);
      } else if (promos.length > 1) {
        const fragments = promos.map((promo) =>
          getBrowseFilterForPromoType(promo),
        );
        where.push(
          `(${fragments.map((fragment) => fragment.sql).join(" OR ")})`,
        );
        params.push(...fragments.flatMap((fragment) => fragment.params));
      }
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
   * This method counts vehicles grouped by a facet column.
   * The facet filter key is excluded so unchecked buckets still receive counts
   * under the remaining browse filters.
   * @param {object} filters Browse filters
   * @param {object} options
   * @param {string} options.excludeKey Filter key to omit while counting (e.g. body_shape)
   * @param {string} options.columnSql SQL expression to group by (e.g. vm.body_shape)
   * @param {string[]} options.allowedValues Canonical values from constants (0-filled)
   * @returns {Promise<{ value: string, count: number }[]>}
   * @throws {ValidationError} If the sort is not supported
   * @throws {DatabaseError} On database failures
   */
  async countVehiclesByFacet(filters = {}, options = {}) {
    const { excludeKey, columnSql, allowedValues } = options;
    const facetFilters = { ...filters };

    if (excludeKey) {
      delete facetFilters[excludeKey];
    }

    const query = this.#buildVehicleQuery(facetFilters);
    const [rows] = await this._query(
      `SELECT ${columnSql} AS value, COUNT(*) AS count
             FROM catalog_items ci
             ${query.joins}
             WHERE ${query.where}
               AND ${columnSql} IS NOT NULL
             GROUP BY ${columnSql}`,
      query.params,
      { suppressNotFound: true },
    );

    const countByValue = new Map(
      rows.map((row) => [String(row.value), Number(row.count)]),
    );

    return allowedValues.map((value) => ({
      value,
      count: countByValue.get(value) ?? 0,
    }));
  }

  /**
   * Counts vehicles for each canonical promotion type under the remaining
   * browse filters. The selected promo is excluded, matching other facets.
   * @param {object} filters Browse filters
   * @param {string[]} allowedValues Canonical promotion types
   * @returns {Promise<{ value: string, count: number }[]>}
   */
  async countVehiclesByPromoFacet(filters = {}, allowedValues = []) {
    const facetFilters = { ...filters };
    delete facetFilters.promo;

    return Promise.all(
      allowedValues.map(async (value) => {
        const query = this.#buildVehicleQuery(facetFilters);
        const fragment = getBrowseFilterForPromoType(value);
        const [rows] = await this._query(
          `SELECT COUNT(*) AS count
                 FROM catalog_items ci
                 ${query.joins}
                 WHERE ${query.where}
                   AND ${fragment.sql}`,
          [...query.params, ...fragment.params],
        );

        return {
          value,
          count: Number(rows[0]?.count ?? 0),
        };
      }),
    );
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
                b.country AS brand_country,
                b.is_featured AS brand_is_featured,
                b.display_order AS brand_display_order,
                b.media_id AS brand_media_id,
                ml.url AS brand_logo_url,
                ml.file_type AS brand_logo_file_type,
                ml.alt_text AS brand_logo_alt_text
             FROM catalog_items ci
             JOIN models m ON m.model_id = ci.model_id
             JOIN brands b ON b.brand_id = m.brand_id
             LEFT JOIN media ml ON ml.media_id = b.media_id
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
                v.exterior_color,
                v.interior_color,
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
