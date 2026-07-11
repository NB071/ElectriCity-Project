// Chatbot Prompt Director
// Design Pattern / Technique: Director / Object-Oriented Programming (OOP)

import PromptTemplateBuilder from "./PromptTemplateBuilder.js";
import validateChatPrompt from "../promptValidator.js";
import { TEMPLATES, SYSTEM_PROMPTS } from "../constants.js";
import { ValidationError } from "../../../utils/errors.js";

/**
 * Directs prompt building for each chatbot template.
 * @class
 */
class PromptDirector {
    /**
     * This property contains the prompt template builder.
     * @type {PromptTemplateBuilder}
     */
    #builder;

    /**
     * This constructor creates a new PromptDirector instance.
     * @constructor
     */
    constructor() {
        this.#builder = new PromptTemplateBuilder();
    }

    /**
     * This method composes the system prompt for a given template.
     * @private
     * @param {string} templateKey Name of the template to compose the system prompt for.
     * @returns {string} Composed system prompt.
     */
    #composeSystemPrompt(templateKey) {
        return [SYSTEM_PROMPTS.BASE, SYSTEM_PROMPTS[templateKey]]
            .filter(Boolean)
            .join(" ");
    }

    /**
     * This method builds the context blocks for a given template.
     * @private
     * @param {object} vars Variables for the template.
     * @returns {string[]} Context blocks for the template.
     */
    #buildTemplateContextBlocks(vars) {
        const blocks = [];

        if (vars.model_name || vars.item_name) {
            const label = vars.model_name ?? vars.item_name;
            blocks.push(`The customer is currently viewing the ${label}.`);
        } else if (vars.cid) {
            const label = vars.item_name
                ? `${vars.item_name} (cid ${vars.cid})`
                : `cid ${vars.cid}`;
            blocks.push(
                `The customer is currently viewing catalog item ${label}.`,
            );
        }

        if (vars.base_price != null) {
            blocks.push(`Listed base price: $${vars.base_price}.`);
        }

        if (vars.cart_id) {
            blocks.push(
                `Active cart id: ${vars.cart_id}${vars.item_count != null ? ` with ${vars.item_count} item(s)` : ""}.`,
            );
        }

        return blocks;
    }

    /**
     * This method builds the prompt for a given template.
     * @private
     * @param {string} templateKey Name of the template to build the prompt for.
     * @param {string} userMessage User prompt for the prompt template.
     * @param {object} vars Variables for the template.
     * @param {string[]} context Context blocks for the prompt template.
     * @returns {import("./PromptTemplate.js").default} Prompt template instance.
     */
    #buildPrompt(templateKey, userMessage, vars, context) {
        return this.#builder
            .setTemplate(templateKey)
            .setSystemPrompt(this.#composeSystemPrompt(templateKey))
            .setUserMessage(userMessage)
            .addContextBlocks(this.#buildTemplateContextBlocks(vars))
            .addContextBlocks(context)
            .build();
    }

    #buildProductInquiry(userMessage, vars, context) {
        return this.#buildPrompt(
            TEMPLATES.PRODUCT_INQUIRY,
            userMessage,
            vars,
            context,
        );
    }

    #buildCartAssist(userMessage, vars, context) {
        return this.#buildPrompt(
            TEMPLATES.CART_ASSIST,
            userMessage,
            vars,
            context,
        );
    }

    #buildGeneralSupport(userMessage, vars, context) {
        return this.#buildPrompt(
            TEMPLATES.GENERAL_SUPPORT,
            userMessage,
            vars,
            context,
        );
    }

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
     * This method directs the prompt building for a given template.
     * @param {object} data
     * @param {string} data.template Name of the template to build the prompt for.
     * @param {string} data.userMessage User prompt for the prompt template.
     * @param {object} [data.vars] Variables for the template.
     * @param {string[]} [data.context] Context blocks for the prompt template.
     * @returns {{ template: string, prompt: import("./PromptTemplate.js").default, messages: object[] }} Prompt data.
     */
    direct({ template, userMessage, vars = {}, context = [] }) {
        const validated = validateChatPrompt({
            template,
            userMessage,
            vars,
            context,
        });

        const prompt = this.#buildByTemplate(
            validated.template,
            validated.userMessage,
            validated.vars,
            validated.context,
        );

        return {
            template: validated.template,
            prompt,
            messages: prompt.generateMessages(),
        };
    }
}

export default new PromptDirector();
