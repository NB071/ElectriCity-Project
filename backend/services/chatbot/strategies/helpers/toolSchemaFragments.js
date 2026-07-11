// Shared Gemini function parameter fragments for catalog tool strategies

import { Type } from "@google/genai";
import { VALIDATIONS } from "../../constants.js";

/**
 * This object contains the properties for the vehicle filter tool.
 * @type {object} Properties for the vehicle filter tool.
 */
const vehicleFilterProperties = {
    brand_id: {
        type: Type.INTEGER,
        description: "Filter by brand id.",
    },
    model_id: {
        type: Type.INTEGER,
        description: "Filter by model id.",
    },
    condition: {
        type: Type.STRING,
        description: 'Vehicle condition: "new" or "used".',
        enum: VALIDATIONS.TOOL_ARGS.VEHICLE_CONDITIONS,
    },
    year_min: {
        type: Type.INTEGER,
        description: "Minimum model year.",
    },
    year_max: {
        type: Type.INTEGER,
        description: "Maximum model year.",
    },
    price_min: {
        type: Type.NUMBER,
        description: "Minimum base price in USD.",
    },
    price_max: {
        type: Type.NUMBER,
        description: "Maximum base price in USD.",
    },
    mileage_max: {
        type: Type.INTEGER,
        description: "Maximum mileage for used vehicles.",
    },
    body_shape: {
        type: Type.STRING,
        description: "Body style such as sedan, suv, or hatchback.",
    },
    drivetrain: {
        type: Type.STRING,
        description: "Drivetrain such as awd, fwd, or rwd.",
    },
    sort: {
        type: Type.STRING,
        description: "Sort order for results.",
        enum: VALIDATIONS.TOOL_ARGS.SORT_VALUES,
    },
    page: {
        type: Type.INTEGER,
        description: "Page number for pagination.",
    },
    limit: {
        type: Type.INTEGER,
        description: "Items per page (max 10 for chatbot responses).",
    },
};

/**
 * This object contains the properties for the vehicle reference tool.
 * @type {object} Properties for the vehicle reference tool.
 */
const vehicleReferenceProperties = {
    cid: {
        type: Type.INTEGER,
        description:
            "Catalog item id. Use when known; otherwise use model_name.",
    },
    model_name: {
        type: Type.STRING,
        description:
            'Model name, e.g. "Model 3", "Model Y", "Mustang Mach-E", "bZ4X".',
    },
    brand_name: {
        type: Type.STRING,
        description:
            'Optional brand to disambiguate, e.g. "Tesla", "Ford", "Toyota".',
    },
    condition: {
        type: Type.STRING,
        description:
            'Optional filter when model_name matches multiple listings: "new" or "used".',
        enum: VALIDATIONS.TOOL_ARGS.VEHICLE_CONDITIONS,
    },
    year: {
        type: Type.INTEGER,
        description:
            "Optional model year when model_name matches multiple listings.",
    },
};

export { vehicleFilterProperties, vehicleReferenceProperties };
