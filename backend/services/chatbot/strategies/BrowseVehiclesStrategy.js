// Browse vehicles tool strategy
// Strategy pattern / tool strategy

import { Type } from "@google/genai";
import ToolStrategy from "./helpers/ToolStrategy.js";
import { TOOLS } from "../constants.js";
import { vehicleFilterProperties } from "./helpers/toolSchemaFragments.js";
import { DEFAULTS } from "../constants.js";
import catalogService from "../../catalog/catalog.service.js";

/**
 * This class implements the browse vehicles tool strategy.
 * @class
 * @extends ToolStrategy
 */
class BrowseVehiclesStrategy extends ToolStrategy {
    /**
     * This getter method returns the name of the tool.
     * @returns {string} Name of the tool.
     */
    get name() {
        return TOOLS.BROWSE_VEHICLES;
    }

    /**
     * This getter method returns the declaration of the tool.
     * @returns {object} Declaration of the tool.
     */
    getDeclaration() {
        return {
            name: this.name,
            description:
                "Browse the vehicle catalog with optional filters such as price range, condition, year, mileage, body shape, and drivetrain.",
            parameters: {
                type: Type.OBJECT,
                properties: vehicleFilterProperties,
            },
        };
    }

    /**
     * This method executes the tool.
     * @param {object} args Arguments to pass to the tool.
     * @returns {Promise<object>} Result of the tool execution.
     */
    async execute(args) {
        // Browse the vehicle catalog with optional filters
        return catalogService.browseVehicles({
            page: DEFAULTS.TOOL_PAGE,
            limit: DEFAULTS.TOOL_LIMIT,
            sort: DEFAULTS.TOOL_SORT,
            ...args,
        });
    }
}

export default new BrowseVehiclesStrategy();
