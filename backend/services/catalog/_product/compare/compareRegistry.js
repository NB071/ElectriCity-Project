// Compare Registry
// Design Pattern / Technique: Template Method / Object-Oriented Programming (OOP)

import VehicleCompareHandler from "./vehicleCompareHandler.js";
import { ITEM_TYPES } from "../../constants.js";
import { ValidationError } from "../../../../utils/errors.js";

/**
 * This class is used to register the compare handlers for different catalog item types.
 * @class
 */
class CompareRegistry {
    /**
     * This constructor creates a new CompareRegistry instance.
     * @param {object} deps
     * @param {ProductDAO} deps.productDAO
     * @param {CompareMatrixAssembler} deps.compareMatrixAssembler
     * @returns {CompareRegistry}
     */
    constructor({ productDAO, compareMatrixAssembler }) {
        this.productDAO = productDAO;
        this.compareMatrixAssembler = compareMatrixAssembler;
        this.handlers = {
            [ITEM_TYPES.VEHICLE]: VehicleCompareHandler,
            // more handlers can be added in future here
        };
    }

    /**
     * This method is used to get the compare handler for a given catalog item type.
     * @param {string} itemType
     * @returns {CatalogCompareHandler}
     * @throws {ValidationError} If the catalog item type is unknown
     */
    get(itemType) {
        const Handler = this.handlers[itemType];

        if (!Handler) {
            throw new ValidationError(`Unknown catalog type: ${itemType}`);
        }

        return new Handler({
            productDAO: this.productDAO,
            compareMatrixAssembler: this.compareMatrixAssembler,
        });
    }
}

export default CompareRegistry;
