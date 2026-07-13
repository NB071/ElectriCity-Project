// Search vehicles tool strategy

import { Type } from "@google/genai";
import ToolStrategy from "./helpers/ToolStrategy.js";
import { TOOLS } from "../constants.js";
import { vehicleFilterProperties } from "./helpers/toolSchemaFragments.js";
import { DEFAULTS } from "../constants.js";
import catalogService from "../../catalog/catalog.service.js";

/**
 * This class implements the search vehicles tool strategy.
 * @class
 * @extends ToolStrategy
 */
class SearchVehiclesStrategy extends ToolStrategy {
    /**
     * This getter method returns the name of the tool.
     * @returns {string} Name of the tool.
     */
    get name() {
        return TOOLS.SEARCH_VEHICLES;
    }

    /**
     * This getter method returns the declaration of the tool.
     * @returns {object} Declaration of the tool.
     */
    getDeclaration() {
        return {
            name: this.name,
            description:
                "Search vehicles by keyword (brand, model, etc.) and optionally apply filters like price_max, condition, mileage_max, body_shape, or drivetrain.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    q: {
                        type: Type.STRING,
                        description:
                            "Search query, e.g. Tesla, Model 3, SUV, AWD.",
                    },
                    ...vehicleFilterProperties,
                },
                required: ["q"],
            },
        };
    }

    /**
     * This method executes the tool.
     * @param {object} args Arguments to pass to the tool.
     * @returns {Promise<object>} Result of the tool execution.
     */
    async execute(args) {
        // Search the vehicle catalog with optional filters
        return catalogService.searchVehicles({
            page: DEFAULTS.TOOL_PAGE,
            limit: DEFAULTS.TOOL_LIMIT,
            sort: DEFAULTS.TOOL_SORT,
            ...args,
        });
    }
}

export default new SearchVehiclesStrategy();
