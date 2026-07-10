// Get customization options tool strategy

import { Type } from "@google/genai";

import ToolStrategy from "./helpers/ToolStrategy.js";

import { TOOLS } from "../constants.js";
/**
 * This class implements the get customization options tool strategy.
 * @class
 * @extends ToolStrategy
 */

/**
 * This getter method returns the name of the tool.
 * @returns {string} Name of the tool.
 */
import { vehicleReferenceProperties } from "./helpers/toolSchemaFragments.js";

import resolveVehicleReference from "./helpers/resolveVehicleReference.js";

/**
 * This getter method returns the declaration of the tool.
 * @returns {object} Declaration of the tool.
 */
import catalogService from "../../catalog/catalog.service.js";

class GetCustomizationOptionsStrategy extends ToolStrategy {
    /**
     * This getter method returns the name of the tool.
     * @returns {string} Name of the tool.
     */
    get name() {
        return TOOLS.GET_CUSTOMIZATION_OPTIONS;
    }

    /**
     * This getter method returns the declaration of the tool.
     * @returns {object} Declaration of the tool.
     */
    /**
     * This method executes the tool.
     * @param {object} args Arguments for the tool.
     * @returns {Promise<object>} Result of the tool execution.
     */
    getDeclaration() {
        return {
            name: this.name,

            description:
                "List customization options (colors, wheels, interior, etc.) for a vehicle by cid or model name. Use brand_name, condition, or year if needed to pick the right listing.",

            parameters: {
                type: Type.OBJECT,

                properties: vehicleReferenceProperties,
            },
        };
    }

    /**
     * This method executes the tool.
     * @param {object} args Arguments for the tool.
     * @returns {Promise<object>} Result of the tool execution.
     */
    async execute(args) {
        const resolved = await resolveVehicleReference(args);

        if (resolved.error) {
            return resolved;
        }

        if (resolved.ambiguous) {
            return {
                ambiguous: true,

                message:
                    "Multiple vehicles match that model name. Ask the customer to pick one or pass condition/year/cid.",

                matches: resolved.matches,
            };
        }

        // Get the details of the catalog item
        const details = await catalogService.getCatalogItemDetails(
            resolved.cid,
        );

        // Return the details of the catalog item
        return {
            cid: details.id,
            name: details.name,
            base_price: details.base_price,
            customizations: details.customizations ?? [],
        };
    }
}

export default new GetCustomizationOptionsStrategy();
