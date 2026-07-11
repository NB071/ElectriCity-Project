// Prompt Template Generation
// Design Pattern: Product (Builder)

import { ROLES } from "../constants.js";

/**
 * Built system/user prompt pair for the AI client.
 * @class
 */
class PromptTemplate {
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
        this.template = template;
        return this;
    }

    /**
     * This method sets the system prompt for the prompt template.
     * @param {string} systemPrompt
     * @returns {PromptTemplate}
     */
    setSystemPrompt(systemPrompt) {
        this.systemPrompt = systemPrompt;
        return this;
    }

    /**
     * This method sets the user prompt for the prompt template.
     * @param {string} userPrompt
     * @returns {PromptTemplate}
     */
    setUserPrompt(userPrompt) {
        this.userPrompt = userPrompt;
        return this;
    }

    /**
     * This method adds a context block to the prompt template.
     * @param {string} block
     * @returns {PromptTemplate}
     */
    addContextBlock(block) {
        if (block?.trim()) {
            this.context.push(block.trim());
        }
        return this;
    }

    /**
     * This method generates the messages for the prompt template.
     * @returns {{ role: string, content: string }[]} Messages for the prompt template.
     */
    generateMessages() {
        const userContent =
            this.context.length > 0
                ? `Context:\n${this.context.join("\n")}\n\nUser: ${this.userPrompt}`
                : this.userPrompt;

        return [
            { role: ROLES.SYSTEM, content: this.systemPrompt },
            { role: ROLES.USER, content: userContent },
        ];
    }
}

export default PromptTemplate;
