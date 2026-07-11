// Prompt Template Generation
// Design Pattern / Technique: Builder / Object-Oriented Programming (OOP)

import PromptTemplate from "./PromptTemplate.js";

/**
 * Builds PromptTemplate instances step by step.
 * @class
 */
class PromptTemplateBuilder {
    /**
     * This constructor creates a new PromptTemplateBuilder instance.
     * @constructor
     */
    constructor() {
        this.reset();
    }

    /**
     * This method sets the template key used to build this prompt.
     * @param {string} template Name of the template to build.
     * @returns {PromptTemplateBuilder}
     */
    setTemplate(template) {
        this.template.setTemplate(template);
        return this;
    }

    /**
     * This method sets the system prompt for the prompt template.
     * @param {string} systemPrompt System prompt for the prompt template.
     * @returns {PromptTemplateBuilder}
     */
    setSystemPrompt(systemPrompt) {
        this.template.setSystemPrompt(systemPrompt);
        return this;
    }

    /**
     * This method sets the user prompt for the prompt template.
     * @param {string} userMessage User prompt for the prompt template.
     * @returns {PromptTemplateBuilder}
     */
    setUserMessage(userMessage) {
        this.template.setUserPrompt(userMessage);
        return this;
    }

    /**
     * This method adds a context block to the prompt template.
     * @param {string} block Context block to add to the prompt template.
     * @returns {PromptTemplateBuilder}
     */
    addContextBlock(block) {
        this.template.addContextBlock(block);
        return this;
    }

    /**
     * This method adds multiple context blocks to the prompt template.
     * @param {string[]} blocks Context blocks to add to the prompt template.
     * @returns {PromptTemplateBuilder}
     */
    addContextBlocks(blocks = []) {
        for (const block of blocks) {
            this.addContextBlock(block);
        }
        return this;
    }

    /**
     * This method resets the prompt template builder.
     * @returns {PromptTemplateBuilder} Prompt template builder instance.
     */
    reset() {
        this.template = new PromptTemplate();
        return this;
    }

    /**
     * This method builds the prompt template.
     * @returns {PromptTemplate} Prompt template instance.
     */
    build() {
        const result = this.template;
        this.reset();
        return result;
    }
}

export default PromptTemplateBuilder;
