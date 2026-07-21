// List brands tool strategy
// Strategy pattern / tool strategy

import { Type } from "@google/genai";
import ToolStrategy from "./helpers/ToolStrategy.js";
import { TOOLS } from "../constants.js";
import catalogService from "../../catalog/catalog.service.js";

/**
 * This class implements the list brands tool strategy.
 * Returns lightweight id/name pairs for catalog brand discovery.
 * @class
 * @extends ToolStrategy
 */
class ListBrandsStrategy extends ToolStrategy {
    /**
     * This getter method returns the name of the tool.
     * @returns {string} Name of the tool.
     */
    get name() {
        return TOOLS.LIST_BRANDS;
    }

    /**
     * This getter method returns the declaration of the tool.
     * @returns {object} Declaration of the tool.
     */
    getDeclaration() {
        return {
            name: this.name,
            description:
                "List all brands available in the ElectriCity catalog as id/name pairs (A-Z). Use when the user asks which brands you sell, whether you carry a brand, or before browsing by brand_id. Do not invent brand names.",
            parameters: {
                type: Type.OBJECT,
                properties: {},
            },
        };
    }

    /**
     * This method executes the tool.
     * @param {object} _args Unused (no parameters).
     * @returns {Promise<object>} Result of the tool execution.
     */
    async execute(_args) {
        return catalogService.listBrands({ lite: true });
    }
}

export default new ListBrandsStrategy();
