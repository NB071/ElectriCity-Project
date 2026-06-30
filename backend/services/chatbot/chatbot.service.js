// Chatbot Service (Facade)

import promptDirector from "./PromptDirector.js";
import aiClient from "./AIClient.js";
import { TEMPLATES, VALIDATIONS, DEFAULTS, ROLES } from "./constants.js";

/**
 * This function builds validated system/user messages without calling the AI provider.
 * Useful for testing prompt output or preview endpoints.
 * @param {object} data
 * @param {string} data.template
 * @param {string} data.userMessage
 * @param {object} [data.vars]
 * @param {string[]} [data.context]
 * @returns {Promise<{ template: string, prompt: object, messages: object[] }>}
 * @throws {ValidationError} If validation fails
 */
async function buildPrompt({ template, userMessage, vars = {}, context = [] }) {
    try {
        // TODO: return promptDirector.direct({ template, userMessage, vars, context })
    } catch (err) {
        console.error("[Service: Chatbot] buildPrompt failed:", err.message);
        throw err;
    }
}

/**
 * This function validates, builds prompts, and sends a chat completion request.
 * @param {object} data
 * @param {string} data.template
 * @param {string} data.userMessage
 * @param {object} [data.vars]
 * @param {string[]} [data.context]
 * @returns {Promise<{ template: string, reply: string, messages: object[] }>}
 * @throws {ValidationError} If validation fails
 * @throws {AppError} If the AI provider request fails
 * @example
 * {
 *     template: "general-support",
 *     reply: "ElectriCity offers both new and used electric vehicles. How can I help you today?",
 *     messages: [
 *         { role: "system", content: "You are ElectriCity Shop Assistant..." },
 *         { role: "user", content: "What types of vehicles do you sell?" },
 *     ],
 * }
 */
async function sendMessage({ template, userMessage, vars = {}, context = [] }) {
    try {
        // TODO:
        // const directed = await promptDirector.direct({ template, userMessage, vars, context })
        // const requestOptions = aiClient.buildRequestOptions(directed.prompt)
        // const { reply } = await aiClient.sendChatCompletion(requestOptions)
        // return {
        //     template: directed.template,
        //     reply,
        //     messages: directed.messages,
        // }
    } catch (err) {
        console.error("[Service: Chatbot] sendMessage failed:", err.message);
        throw err;
    }
}

const chatbotService = {
    buildPrompt,
    sendMessage,
    TEMPLATES,
    VALIDATIONS,
    DEFAULTS,
    ROLES,
};

export default chatbotService;

export {
    buildPrompt,
    sendMessage,
    TEMPLATES,
    VALIDATIONS,
    DEFAULTS,
    ROLES,
};
