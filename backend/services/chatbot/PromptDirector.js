// Chatbot Prompt Director
// Design Pattern: Director

import PromptTemplateBuilder from "./PromptTemplateBuilder.js";
import validateChatPrompt from "./promptValidator.js";
import { TEMPLATES } from "./constants.js";
import { ValidationError } from "../../utils/errors.js";

/**
 * This class directs the prompt building process for each chatbot template.
 * @class
 */
class PromptDirector {
    #builder;

    /**
     * This constructor creates a new PromptTemplateBuilder instance.
     * @constructor
     */
    constructor() {
        // TODO: this.#builder = new PromptTemplateBuilder()
    }

    /**
     * This method builds a product inquiry prompt.
     * @private
     * @param {string} userMessage
     * @param {object} vars
     * @param {string[]} context
     * @returns {import("./PromptTemplate.js").default}
     */
    #buildProductInquiry(userMessage, vars, context) {
        // TODO:
        // similar to email service, use builder to make this
    }

    /**
     * This method builds a cart assistance prompt.
     * @private
     * @param {string} userMessage
     * @param {object} vars
     * @param {string[]} context
     * @returns {import("./PromptTemplate.js").default}
     */
    #buildCartAssist(userMessage, vars, context) {
        // TODO:
        // similar to email service, use builder to make this
    }

    /**
     * This method builds a general support prompt.
     * @private
     * @param {string} userMessage
     * @param {object} vars
     * @param {string[]} context
     * @returns {import("./PromptTemplate.js").default}
     */
    #buildGeneralSupport(userMessage, vars, context) {
        // TODO:
        // similar to email service, use builder to make this
    }

    /**
     * This method builds a prompt by template key.
     * Note: New templates should also define a dedicated validator in promptValidator.js
     * @private
     * @param {string} template
     * @param {string} userMessage
     * @param {object} vars
     * @param {string[]} context
     * @returns {import("./PromptTemplate.js").default}
     * @throws {ValidationError} If the template is unknown
     */
    #buildByTemplate(template, userMessage, vars, context) {
        switch (template) {
            case TEMPLATES.PRODUCT_INQUIRY:
                return this.#buildProductInquiry(userMessage, vars, context);
            case TEMPLATES.CART_ASSIST:
                return this.#buildCartAssist(userMessage, vars, context);
            case TEMPLATES.GENERAL_SUPPORT:
                return this.#buildGeneralSupport(userMessage, vars, context);
            default:
                throw new ValidationError(`Unknown template: ${template}`);
        }
    }

    /**
     * This method validates input and directs the prompt building process.
     * @param {object} data
     * @param {string} data.template
     * @param {string} data.userMessage
     * @param {object} [data.vars]
     * @param {string[]} [data.context]
     * @returns {{ template: string, prompt: import("./PromptTemplate.js").default, messages: object[] }}
     * @throws {ValidationError} If validation fails or the template is unknown
     * @example
     * {
     *     template: "product-inquiry",
     *     prompt: PromptTemplate,
     *     messages: [
     *         { role: "system", content: "You are ElectriCity Shop Assistant..." },
     *         {
     *             role: "user",
     *             content: "Context:\n- Tesla Model 3, cid 5, base price $52990\n\nUser: Is pearl white available?",
     *         },
     *     ],
     * }
     */
    direct({ template, userMessage, vars = {}, context = [] }) {
        // TODO:
        // validate the prompt
        // build the prompt using the builder
        // return the prompt object
    }
}

export default new PromptDirector();
