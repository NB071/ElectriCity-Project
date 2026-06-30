// Catalog Details Handler
// Design Pattern / Technique: GoF Template Method / Object-Oriented Programming (OOP)

import { NotFoundError } from "../../../../utils/errors.js";

/**
 * This template-method class is used to handle the details of a catalog item.
 * @class
 * @abstract
 * @see {@link https://refactoring.guru/design-patterns/template-method}
 * @param {object} options
 * @param {ProductDAO} options.productDAO
 * @param {OptionsQuery} options.optionsQuery
 * @returns {CatalogDetailsHandler}
 */
class CatalogDetailsHandler {
    constructor({ productDAO, optionsQuery, mediaAdapter }) {
        this.productDAO = productDAO;
        this.optionsQuery = optionsQuery;
        this.mediaAdapter = mediaAdapter;
    }

    /**
     * This method is used to get the details of a catalog item.
     * @param {number} cid
     * @returns {Promise<object>}
     * @throws {NotFoundError} If the catalog item does not exist
     * @throws {NotFoundError} If the catalog item subtype does not exist
     * @throws {DatabaseError} On database failures
     */
    async getDetails(cid) {
        const base = await this._fetchBase(cid);
        if (!base) {
            throw new NotFoundError("Catalog item");
        }

        const subtype = await this._fetchSubtype(cid);
        if (subtype == null) {
            throw new NotFoundError("Catalog item subtype");
        }
        const customizations = await this.optionsQuery.getForItem(cid);
        const history = await this._fetchHistory(cid);

        return this._assemble({ base, subtype, customizations, history });
    }

    /**
     * This method is used to fetch the base details of a catalog item.
     * @protected
     * @param {number} cid
     * @returns {Promise<object>}
     */
    _fetchBase(cid) {
        return this.productDAO.findBaseById(cid);
    }

    /**
     * This method is used to fetch the history of a catalog item.
     * @abstract
     * @protected
     * @param {number} cid
     * @returns {Promise<object>}
     */
    async _fetchHistory(_cid) {
        return null;
    }

    /**
     * This method is used to fetch the subtype of a catalog item.
     * @abstract
     * @protected
     * @param {number} cid
     * @returns {Promise<object>}
     */
    async _fetchSubtype(_cid) {
        throw new Error("_fetchSubtype not implemented");
    }

    /**
     * This method is used to assemble the details of a catalog item.
     * @abstract
     * @protected
     * @param {object} _parts
     * @returns {Promise<object>}
     */
    _assemble(_parts) {
        throw new Error("_assemble not implemented");
    }
}

export default CatalogDetailsHandler;
