// Prompt Template Generation
// Design Pattern: Product (Builder)

import { ROLES } from "./constants.js";

/**
 * This class represents a built system/user prompt pair for the AI client.
 * @class
 */
class PromptTemplate {
    // Please expand on this.
    static DEFAULT_SYSTEM_PREFIX =
        "You are ElectriCity Shop Assistant, a helpful e-commerce chatbot for electric vehicles and related products.";

    /**
     * This constructor creates a new PromptTemplate instance.
     * @constructor
     */
    constructor() {
        this.template = "";
        this.systemPrompt = PromptTemplate.DEFAULT_SYSTEM_PREFIX;
        this.userPrompt = "";
        this.context = [];
    }

    /**
     * This method sets the template key used to build this prompt.
     * @param {string} template
     * @returns {PromptTemplate}
     */
    setTemplate(template) {
        // TODO: Set this.template
        return this;
    }

    /**
     * This method sets the system prompt.
     * @param {string} systemPrompt
     * @returns {PromptTemplate}
     */
    setSystemPrompt(systemPrompt) {
        // TODO: Set this.systemPrompt
        return this;
    }

    /**
     * This method sets the user prompt.
     * @param {string} userPrompt
     * @returns {PromptTemplate}
     */
    setUserPrompt(userPrompt) {
        // TODO: Set this.userPrompt
        return this;
    }

    /**
     * This method adds a context block (e.g. catalog snippet, cart summary).
     * @param {string} block
     * @returns {PromptTemplate}
     */
    addContextBlock(block) {
        // TODO: Push block onto this.context
        return this;
    }

    /**
     * This method serializes the prompt into chat-completion message objects.
     * @returns {{ role: string, content: string }[]}
     * @example
     * [
     *     {
     *         role: "system",
     *         content: "You are ElectriCity Shop Assistant...",
     *     },
     *     {
     *         role: "user",
     *         content: "Context:\n- Tesla Model 3, base price $52990\n\nUser: Is this available in white?",
     *     },
     * ]
     */
    generateMessages() {
        // TODO:
        // Build messages array using ROLES.SYSTEM and ROLES.USER
        // Prepend joined context blocks to the user message when this.context is non-empty
    }
}

export default PromptTemplate;
