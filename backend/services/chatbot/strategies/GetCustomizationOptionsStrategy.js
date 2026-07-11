// Get customization options tool strategy

import { Type } from "@google/genai";
import ToolStrategy from "./helpers/ToolStrategy.js";
import { TOOLS } from "../constants.js";
import { vehicleReferenceProperties } from "./helpers/toolSchemaFragments.js";
import resolveVehicleReference from "./helpers/resolveVehicleReference.js";
import catalogService from "../../catalog/catalog.service.js";

/**
 * This class implements the get customization options tool strategy.
 * @class
 * @extends ToolStrategy
 */
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
    getDeclaration() {
        return {
            name: this.name,
            description:
                "List options for a vehicle by cid or model name. Returns equipped_options (already installed on the vehicle, common for used cars) and customizations (extra options still available for purchase; may be empty). Use brand_name, condition, or year if needed to pick the right listing.",
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

        const details = await catalogService.getCatalogItemDetails(
            resolved.cid,
        );

        return {
            cid: details.id,
            name: details.name,
            base_price: details.base_price,
            condition: details.vehicle?.condition ?? null,
            equipped_options: details.equipped_options ?? [],
            customizations: details.customizations ?? [],
        };
    }
}

export default new GetCustomizationOptionsStrategy();
