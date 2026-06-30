// Vehicle Compare Handler
// Design Pattern / Technique: GoF Template Method / Object-Oriented Programming (OOP)

import CatalogCompareHandler from "./catalogCompareHandler.js";

/**
 * This class is used to compare vehicles.
 * @class
 * @extends CatalogCompareHandler
 * @see {@link https://refactoring.guru/design-patterns/template-method}
 */
class VehicleCompareHandler extends CatalogCompareHandler {
    /**
     * This method is used to get the comparable fields for a vehicle.
     * @param {object} item
     * @returns {Promise<object>}
     */
    _comparableFields(item) {
        return {
            price: { value: parseFloat(item.base_price), direction: "lower" },
            year: { value: item.year, direction: "higher" },
            mileage: { value: item.mileage, direction: "lower" },
            condition: { value: item.condition, direction: "none" },
        };
    }
}

export default VehicleCompareHandler;
