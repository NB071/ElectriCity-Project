// Get vehicle facets tool strategy
// Strategy pattern / tool strategy

import { Type } from "@google/genai";
import ToolStrategy from "./helpers/ToolStrategy.js";
import { TOOLS, VALIDATIONS } from "../constants.js";
import { vehicleFilterProperties } from "./helpers/toolSchemaFragments.js";
import catalogService from "../../catalog/catalog.service.js";

const {
    brand_id,
    model_id,
    condition,
    year_min,
    year_max,
    price_min,
    price_max,
    mileage_max,
    body_shape,
    drivetrain,
} = vehicleFilterProperties;

/**
 * This class implements the get vehicle facets tool strategy.
 * @class
 * @extends ToolStrategy
 */
class GetVehicleFacetsStrategy extends ToolStrategy {
    /**
     * This getter method returns the name of the tool.
     * @returns {string} Name of the tool.
     */
    get name() {
        return TOOLS.GET_VEHICLE_FACETS;
    }

    /**
     * This getter method returns the declaration of the tool.
     * @returns {object} Declaration of the tool.
     */
    getDeclaration() {
        return {
            name: this.name,
            description:
                "Get inventory facet counts (total plus body_shape, condition, drivetrain, and promotion buckets). Use when the user asks how many vehicles match a category or wants filter counts. Optional filters narrow the base set; omit filters for full-inventory counts. Optional fields selects which facet groups to return.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    brand_id,
                    model_id,
                    condition,
                    year_min,
                    year_max,
                    price_min,
                    price_max,
                    mileage_max,
                    body_shape,
                    drivetrain,
                    fields: {
                        type: Type.ARRAY,
                        description:
                            "Facet groups to return. Omit for all (body_shape, condition, drivetrain, promo).",
                        items: {
                            type: Type.STRING,
                            enum: VALIDATIONS.TOOL_ARGS.FACET_FIELDS,
                        },
                    },
                },
            },
        };
    }

    /**
     * This method executes the tool.
     * @param {object} args Arguments to pass to the tool.
     * @returns {Promise<object>} Result of the tool execution.
     */
    async execute(args) {
        return catalogService.getVehicleFacets(args);
    }
}

export default new GetVehicleFacetsStrategy();
