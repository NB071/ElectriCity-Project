// Chatbot Tool Strategies
// Strategy pattern / abstract tool strategy

/**
 * Abstract base class for Gemini function-calling tool strategies.
 * @abstract
 */
class ToolStrategy {
    /**
     * This getter method returns the name of the tool.
     * @returns {string}
     */
    get name() {
        throw new Error("name getter must be implemented by subclass");
    }

    /**
     * This getter method returns the declaration of the tool.
     * @returns {import("@google/genai").FunctionDeclaration}
     */
    getDeclaration() {
        throw new Error("getDeclaration() must be implemented by subclass");
    }

    /**
     * This method executes the tool.
     * @param {object} _args Validated tool arguments from Gemini
     * @returns {Promise<object>}
     */
    async execute(_args) {
        throw new Error("execute() must be implemented by subclass");
    }
}

export default ToolStrategy;
