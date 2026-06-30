// Prompt Template Generation
// Design Pattern / Technique: Builder / Object-Oriented Programming (OOP)

import PromptTemplate from "./PromptTemplate.js";

/**
 * This class builds PromptTemplate instances step by step.
 * @class
 */
class PromptTemplateBuilder {
    /**
     * This constructor creates a new PromptTemplateBuilder instance.
     * @constructor
     */
    constructor() {
        // TODO: Call this.reset()
    }

    /**
     * This method sets the template key.
     * @param {string} template
     * @returns {PromptTemplateBuilder}
     */
    setTemplate(template) {
        // TODO: Delegate to this.template.setTemplate(template)
        return this;
    }

    /**
     * This method sets the system prompt.
     * @param {string} systemPrompt
     * @returns {PromptTemplateBuilder}
     */
    setSystemPrompt(systemPrompt) {
        // TODO: Delegate to this.template.setSystemPrompt(systemPrompt)
        return this;
    }

    /**
     * This method sets the user message.
     * @param {string} userMessage
     * @returns {PromptTemplateBuilder}
     */
    setUserMessage(userMessage) {
        // TODO: Delegate to this.template.setUserPrompt(userMessage)
        return this;
    }

    /**
     * This method adds one context block to the prompt.
     * @param {string} block
     * @returns {PromptTemplateBuilder}
     */
    addContextBlock(block) {
        // TODO: Delegate to this.template.addContextBlock(block)
        return this;
    }

    /**
     * This method adds multiple context blocks to the prompt.
     * @param {string[]} blocks
     * @returns {PromptTemplateBuilder}
     */
    addContextBlocks(blocks = []) {
        // TODO: Iterate blocks and call addContextBlock for each
        return this;
    }

    /**
     * This method resets the builder to a fresh PromptTemplate.
     * @returns {PromptTemplateBuilder}
     */
    reset() {
        // TODO: this.template = new PromptTemplate()
        return this;
    }

    /**
     * This method returns the built prompt and resets the builder.
     * @returns {PromptTemplate}
     */
    build() {
        // TODO:
        // const result = this.template
        // this.reset()
        // return result
    }
}

export default PromptTemplateBuilder;
