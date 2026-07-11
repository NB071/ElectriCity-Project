// Chatbot Service
// CQRS - Mutation side (Gemini chat completion + tool calling)

import promptDirector from "./builder/PromptDirector.js";
import aiClient from "./AIClient.js";
import { getDeclarationsForTemplate } from "./strategies/index.js";
import { toChatReplyDTO } from "./DTOs/chatReplyDTO.js";

/**
 * Validates input, builds prompts, and sends a chat completion request to Gemini.
 * @param {object} data
 * @param {string} data.template
 * @param {string} data.userMessage
 * @param {object} [data.vars]
 * @param {string[]} [data.context]
 * @returns {Promise<{ reply: string }>}
 * @throws {ValidationError} If validation fails
 * @throws {AppError} If the AI provider request fails
 */
async function sendMessage({ template, userMessage, vars = {}, context = [] }) {
    try {
        const directed = promptDirector.direct({
            template,
            userMessage,
            vars,
            context,
        });

        const functionDeclarations = getDeclarationsForTemplate(
            directed.template,
        );
        const requestOptions = aiClient.buildRequestOptions(
            directed.prompt,
            functionDeclarations,
        );
        const { reply } =
            await aiClient.sendChatCompletion(requestOptions);

        return toChatReplyDTO({ reply });
    } catch (err) {
        console.error("[Service: Chatbot] sendMessage failed:", err.message);
        throw err;
    }
}

export { sendMessage };
