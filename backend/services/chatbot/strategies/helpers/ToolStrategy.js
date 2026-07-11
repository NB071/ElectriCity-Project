// Chatbot Tool Strategies
// Strategy pattern / abstract tool strategy

import { InternalError } from "../../../../utils/errors.js";

/**
 * Abstract base class for Gemini function-calling tool strategies.
 * @abstract
 */
class ToolStrategy {
    /**
     * This getter method returns the name of the tool.
     * @returns {string}
     * @throws {InternalError} If the name getter is not implemented by the subclass
     */
    get name() {
        throw new InternalError("name getter must be implemented by subclass");
    }

    /**
     * This getter method returns the declaration of the tool.
     * @returns {import("@google/genai").FunctionDeclaration}
     * @throws {InternalError} If the declaration getter is not implemented by the subclass
     */
    getDeclaration() {
        throw new InternalError(
            "getDeclaration() must be implemented by subclass",
        );
    }

    /**
     * This method executes the tool.
     * @param {object} _args Validated tool arguments from Gemini
     * @returns {Promise<object>}
     * @throws {InternalError} If the execute method is not implemented by the subclass
     */
    async execute(_args) {
        throw new InternalError("execute() must be implemented by subclass");
    }
}

export default ToolStrategy;
