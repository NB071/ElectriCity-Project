// Details Registry
// Design Pattern / Technique: Template Method / Object-Oriented Programming (OOP)

import VehicleDetailsHandler from "./vehicleDetailsHandler.js";
import { ITEM_TYPES } from "../../constants.js";
import { ValidationError } from "../../../../utils/errors.js";

/**
 * This class is used to register the details handlers for different catalog item types.
 * @class
 */
class DetailsRegistry {
    /**
     * This constructor creates a new DetailsRegistry instance.
     * @param {object} deps
     * @param {ProductDAO} deps.productDAO
     * @param {OptionsQuery} deps.optionsQuery
     * @param {MediaAdapter} deps.mediaAdapter
     * @returns {DetailsRegistry}
     */
    constructor({ productDAO, optionsQuery, mediaAdapter }) {
        this.productDAO = productDAO;
        this.optionsQuery = optionsQuery;
        this.mediaAdapter = mediaAdapter;
        this.handlers = {
            [ITEM_TYPES.VEHICLE]: VehicleDetailsHandler,
            // more handlers can be added in future here
        };
    }

    /**
     * This method is used to get the details handler for a given catalog item type.
     * @param {string} itemType
     * @returns {CatalogDetailsHandler}
     * @throws {ValidationError} If the catalog item type is unknown
     */
    get(itemType) {
        const Handler = this.handlers[itemType];

        if (!Handler) {
            throw new ValidationError(`Unknown catalog type: ${itemType}`);
        }

        return new Handler({
            productDAO: this.productDAO,
            optionsQuery: this.optionsQuery,
            mediaAdapter: this.mediaAdapter,
        });
    }
}

export default DetailsRegistry;
