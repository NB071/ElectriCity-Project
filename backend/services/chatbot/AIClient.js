// AI Client: interaction and usage only. Config lives in configs/ai.js
// Design Pattern: Singleton

/**
 * This class is used to send chat completion requests to the AI provider.
 * @class
 */
class AIClient {
    static #instance;

    #client = null;

    /**
     * This constructor creates a new AIClient instance.
     * @constructor
     */
    constructor() {
        if (AIClient.#instance) {
            return AIClient.#instance;
        }
        AIClient.#instance = this;
    }

    /**
     * This method ensures the AI client is initialized from config.
     * @private
     * @returns {Promise<object>}
     */
    async #ensureClient() {
        // TODO:
        // similar to email/SMTPClient.ensureTransporter()
    }

    /**
     * This method connects to the AI provider.
     * @returns {Promise<object>}
     */
    async connect() {
        // TODO: return this.#ensureClient()
    }

    /**
     * This method builds the provider request payload from a PromptTemplate.
     * @param {import("./PromptTemplate.js").default} promptTemplate
     * @returns {object}
     * @example
     * Whoever implementing this, please visit gemeni docs to confirm final payload structure.
     * {
     *     model: "gpt-4o-mini",
     *     messages: [
     *         { role: "system", content: "..." },
     *         { role: "user", content: "..." },
     *     ],
     * }
     */
    buildRequestOptions(promptTemplate) {
        // TODO:
        // return {
        //     model: aiConfig.model,
        //     messages: promptTemplate.generateMessages(),
        // }
    }

    /**
     * This method sends a chat completion request.
     * @param {object} requestOptions
     * @returns {Promise<{ reply: string, raw: object }>}
     * @throws {AppError} On provider failures
     */
    async sendChatCompletion(requestOptions) {
        // TODO:
        // example: ensureClient() -> client.chat.completions.create(requestOptions)
        // then return something like { reply: response.choices[0].message.content, raw: response }
    }
}

const aiClient = new AIClient();

export default aiClient;
