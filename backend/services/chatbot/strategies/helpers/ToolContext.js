// Chatbot Tool Strategies
// Strategy pattern / tool context

import { InternalError } from "../../../../utils/errors.js";

/**
 * Context that delegates tool execution to a selected strategy.
 * @class
 */
class ToolContext {
    /** @type {import("./ToolStrategy.js").default | null} Strategy to use */
    #strategy = null;

    /**
     * This method sets the strategy to use.
     * @param {import("./ToolStrategy.js").default} strategy
     */
    setStrategy(strategy) {
        this.#strategy = strategy;
    }

    /**
     * This method executes the tool.
     * @param {object} args Arguments to pass to the tool.
     * @returns {Promise<object>} Result of the tool execution.
     * @throws {InternalError} If the strategy is not set
     */
    async execute(args) {
        if (!this.#strategy) {
            throw new InternalError("No tool strategy set.");
        }

        return this.#strategy.execute(args);
    }
}

export default ToolContext;
