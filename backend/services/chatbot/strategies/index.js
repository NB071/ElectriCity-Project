// Chatbot tool strategy registry

import browseVehiclesStrategy from "./BrowseVehiclesStrategy.js";
import searchVehiclesStrategy from "./SearchVehiclesStrategy.js";
import getVehicleDetailsStrategy from "./GetVehicleDetailsStrategy.js";
import getCustomizationOptionsStrategy from "./GetCustomizationOptionsStrategy.js";
import compareVehiclesStrategy from "./CompareVehiclesStrategy.js";
import getStoreFaqStrategy from "./GetStoreFaqStrategy.js";
import ToolContext from "./helpers/ToolContext.js";
import { TEMPLATE_TOOLS, VALIDATIONS } from "../constants.js";
import { ValidationError } from "../../../utils/errors.js";

const strategies = {
    [browseVehiclesStrategy.name]: browseVehiclesStrategy,
    [searchVehiclesStrategy.name]: searchVehiclesStrategy,
    [getVehicleDetailsStrategy.name]: getVehicleDetailsStrategy,
    [getCustomizationOptionsStrategy.name]: getCustomizationOptionsStrategy,
    [compareVehiclesStrategy.name]: compareVehiclesStrategy,
    [getStoreFaqStrategy.name]: getStoreFaqStrategy,
};

/**
 * This function returns the tool strategy for a given name.
 * @param {string} name
 * @returns {import("./helpers/ToolStrategy.js").default}
 * @throws {ValidationError}
 */
function getToolStrategy(name) {
    const strategy = strategies[name];

    if (!strategy) {
        throw new ValidationError(
            `Unknown tool "${name}". Registered: ${Object.keys(strategies).join(", ")}`,
        );
    }

    return strategy;
}

/**
 * This function returns the tool context for a given name.
 * @param {string} name
 * @returns {ToolContext}
 * @throws {ValidationError}
 */
function getToolContext(name) {
    const context = new ToolContext();
    context.setStrategy(getToolStrategy(name));
    return context;
}

/**
 * This function returns the declarations for a given template.
 * @param {string} template Name of the template.
 * @returns {import("@google/genai").FunctionDeclaration[]}
 * @throws {ValidationError}
 */
function getDeclarationsForTemplate(template) {
    // Check if the template is valid
    if (!VALIDATIONS.TEMPLATE_NAMES.includes(template)) {
        throw new ValidationError(`Unknown template: ${template}`);
    }

    // Get the tool names for the template
    const toolNames = TEMPLATE_TOOLS[template] ?? [];

    // Get the declarations for the tool names
    return toolNames.map((name) => getToolStrategy(name).getDeclaration());
}

export default getToolContext;

export {
    getToolStrategy,
    getToolContext,
    getDeclarationsForTemplate,
    strategies,
};
