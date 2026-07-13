// Compare vehicles tool strategy
// Strategy pattern / tool strategy

import { Type } from "@google/genai";
import ToolStrategy from "./helpers/ToolStrategy.js";

import { TOOLS, VALIDATIONS } from "../constants.js";
import { vehicleReferenceProperties } from "./helpers/toolSchemaFragments.js";
import resolveVehicleReference from "./helpers/resolveVehicleReference.js";
import catalogService from "../../catalog/catalog.service.js";

/**
 * This class implements the compare vehicles tool strategy.
 * @class
 * @extends ToolStrategy
 */
class CompareVehiclesStrategy extends ToolStrategy {
    /**
     * This getter method returns the name of the tool.
     * @returns {string} Name of the tool.
     */
    get name() {
        return TOOLS.COMPARE_VEHICLES;
    }

    /**
     * This getter method returns the declaration of the tool.
     * @returns {object} Declaration of the tool.
     */
    getDeclaration() {
        return {
            name: this.name,

            description: `Compare ${VALIDATIONS.TOOL_ARGS.COMPARE_MIN} to ${VALIDATIONS.TOOL_ARGS.COMPARE_MAX} vehicles side by side using catalog ids (cids) and/or model names.`,

            parameters: {
                type: Type.OBJECT,

                properties: {
                    cids: {
                        type: Type.ARRAY,

                        description: "Catalog item ids to compare.",

                        items: { type: Type.INTEGER },
                    },

                    models: {
                        type: Type.ARRAY,

                        description:
                            "Vehicles to compare by model name when cids are not known.",

                        items: {
                            type: Type.OBJECT,

                            properties: vehicleReferenceProperties,
                        },
                    },
                },
            },
        };
    }

    /**
     * This method executes the tool.
     * @param {object} args Arguments for the tool.
     * @returns {Promise<object>} Result of the tool execution.
     */
    async execute(args) {
        const cids = [];
        // Initialize an empty array to store the catalog item ids

        if (Array.isArray(args.cids)) {
            cids.push(...args.cids);
        }
        // If the arguments are an array of catalog item ids, add them to the array
        if (Array.isArray(args.models)) {
            for (const modelRef of args.models) {
                // Resolve the vehicle reference
                const resolved = await resolveVehicleReference(modelRef);

                if (resolved.error) {
                    // If there is an error, return the error
                    return resolved;
                }

                if (resolved.ambiguous) {
                    // If there are multiple vehicles that match the model name, return the error
                    return {
                        ambiguous: true,

                        message: `Multiple listings match "${modelRef.model_name}". Add brand_name, condition, year, or cid.`,

                        matches: resolved.matches,
                    };
                }

                // Add the catalog item id to the array
                cids.push(resolved.cid);
            }
        }

        const uniqueCids = [...new Set(cids)];

        if (uniqueCids.length > VALIDATIONS.TOOL_ARGS.COMPARE_MAX) {
            return {
                error: {
                    code: "VALIDATION_ERROR",

                    message: `Compare supports at most ${VALIDATIONS.TOOL_ARGS.COMPARE_MAX} vehicles.`,
                },
            };
        }

        if (uniqueCids.length < VALIDATIONS.TOOL_ARGS.COMPARE_MIN) {
            return {
                error: {
                    code: "VALIDATION_ERROR",

                    message: `Compare requires at least ${VALIDATIONS.TOOL_ARGS.COMPARE_MIN} distinct vehicles via cids and/or models.`,
                },
            };
        }

        return catalogService.compareCatalogItems({ cids: uniqueCids });
    }
}

export default new CompareVehiclesStrategy();
