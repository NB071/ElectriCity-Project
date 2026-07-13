// This file is in charge of executing the tools via the strategy registry.

import getToolContext from "./strategies/index.js";
import { validateToolArgs, encodeToolResult } from "./promptValidator.js";
import {
    DatabaseError,
    NotFoundError,
    ValidationError,
} from "../../utils/errors.js";

/**
 * @param {Error & { code?: string }} error
 * @returns {object}
 */
function toToolErrorResult(error) {
    return encodeToolResult({
        error: {
            code: error.code ?? "TOOL_ERROR",
            message: error.message,
        },
    });
}

/**
 * This function executes a tool via the strategy registry.
 * @param {string} name Name of the tool to execute.
 * @param {object} args Raw arguments from Gemini
 * @returns {Promise<object>} Encoded function response payload
 */
async function executeTool(name, args = {}) {
    try {
        const validatedArgs = validateToolArgs(name, args);
        const context = getToolContext(name);
        const result = await context.execute(validatedArgs);
        return encodeToolResult(result);
    } catch (error) {
        if (
            error instanceof ValidationError ||
            error instanceof NotFoundError ||
            error instanceof DatabaseError
        ) {
            return toToolErrorResult(error);
        }

        throw error;
    }
}

export default executeTool;

export { executeTool };
