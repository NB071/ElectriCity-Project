// Get vehicle details tool strategy
// Strategy pattern / tool strategy

import { Type } from "@google/genai";
import ToolStrategy from "./helpers/ToolStrategy.js";
import { TOOLS } from "../constants.js";
import { vehicleReferenceProperties } from "./helpers/toolSchemaFragments.js";
import resolveVehicleReference from "./helpers/resolveVehicleReference.js";
import catalogService from "../../catalog/catalog.service.js";

/**
 * This class implements the get vehicle details tool strategy.
 * @class
 * @extends ToolStrategy
 */
class GetVehicleDetailsStrategy extends ToolStrategy {
    /**
     * This getter method returns the name of the tool.
     * @returns {string} Name of the tool.
     */
    get name() {
        return TOOLS.GET_VEHICLE_DETAILS;
    }

    /**
     * This getter method returns the declaration of the tool.
     * @returns {object} Declaration of the tool.
     */
    getDeclaration() {
        return {
            name: this.name,

            description:
                "Get full details for one vehicle by catalog id (cid) or by model name (e.g. Model 3, bZ4X). Use brand_name, condition, or year if the model matches multiple listings.",

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

        return catalogService.getCatalogItemDetails(resolved.cid);
    }
}

export default new GetVehicleDetailsStrategy();
