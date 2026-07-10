// AI Client: Gemini interaction and tool-calling loop
// Design Pattern / Technique: Singleton,Adapter / Object-Oriented Programming (OOP)

import configureAIClient, { aiConfig } from "../../configs/ai.js";
import executeTool from "./toolExecutor.js";
import { ROLES } from "./constants.js";
import { AppError } from "../../utils/errors.js";

/**
 * This class is used to send chat completion requests to the AI provider.
 * @class
 */
class AIClient {
    static #instance;

    /** @type {import("@google/genai").GoogleGenAI | null} */
    #client = null;

    /**
     * This constructor creates a new AIClient instance.
     * @constructor
     */
    constructor() {
        // Check if an instance already exists
        if (AIClient.#instance) {
            return AIClient.#instance;
        }
        // Set the instance
        AIClient.#instance = this;
    }

    /**
     * This method ensures that the AI client is connected.
     * @private
     * @returns {Promise<import("@google/genai").GoogleGenAI>}
     */
    async #ensureClient() {
        if (this.#client) {
            return this.#client;
        }

        this.#client = configureAIClient();
        return this.#client;
    }

    /**
     * This method connects the AI client to the AI provider.
     * @returns {Promise<import("@google/genai").GoogleGenAI>}
     */
    async connect() {
        return this.#ensureClient();
    }

    /**
     * This method splits the messages into system instruction and contents.
     * @private
     * @param {{ role: string, content: string }[]} messages Messages to split.
     * @returns {{ systemInstruction?: string, contents: object[] }}
     */
    #splitMessages(messages = []) {
        // Initialize the system instruction and contents
        let systemInstruction;
        const contents = [];

        // Split the messages into system instruction and contents
        for (const message of messages) {
            if (message.role === ROLES.SYSTEM) {
                systemInstruction = message.content;
                continue;
            }

            // Add the message to the contents
            contents.push({
                role:
                    message.role === ROLES.ASSISTANT ||
                    message.role === ROLES.MODEL
                        ? ROLES.MODEL
                        : ROLES.USER,
                parts: [{ text: message.content }],
            });
        }

        // Return the system instruction and contents
        return { systemInstruction, contents };
    }

    /**
     * This method builds the request options for the AI client.
     * @param {import("./builder/PromptTemplate.js").default} promptTemplate
     * @param {import("@google/genai").FunctionDeclaration[]} [functionDeclarations]
     * @returns {object}
     */
    buildRequestOptions(promptTemplate, functionDeclarations = []) {
        // Generate the messages from the prompt template
        const messages = promptTemplate.generateMessages();
        const { systemInstruction, contents } = this.#splitMessages(messages);

        // Build the request options
        return {
            model: aiConfig.model,
            systemInstruction,
            contents,
            functionDeclarations,
        };
    }

    /**
     * This method extracts the reply text from the response.
     * @private
     * @param {object} response Response from the AI provider.
     * @returns {string} Reply text.
     */
    #extractReplyText(response) {
        if (response?.text) {
            // If the response has text, return it
            return response.text;
        }

        // If the response has candidates, extract the reply text from the parts
        const parts = response?.candidates?.[0]?.content?.parts ?? [];

        // Return the reply text
        return parts
            .map((part) => part.text)
            .filter(Boolean)
            .join("\n")
            .trim();
    }

    /**
     * @private
     * @param {string} reply
     * @returns {string}
     */
    #normalizeReply(reply) {
        const trimmed = (reply ?? "").trim();
        return trimmed || "Sorry, I couldn't generate a response.";
    }

    /**
     * Maps Gemini SDK/provider failures to application errors.
     * @private
     * @param {Error & { status?: number, message?: string }} error
     * @returns {AppError}
     */
    #toProviderError(error) {
        const status = error.status ?? 502;
        const rawMessage = error.message ?? "Gemini request failed.";

        if (status === 401) {
            return new AppError("Gemini rejected the API key (401).", {
                status: 502,
                code: "AI_AUTH_FAILED",
                details: {
                    providerStatus: status,
                    providerMessage: rawMessage,
                },
            });
        }

        if (status === 403) {
            return new AppError("Gemini denied access to this project (403).", {
                status: 502,
                code: "AI_ACCESS_DENIED",
                details: {
                    providerStatus: status,
                    providerMessage: rawMessage,
                },
            });
        }

        if (status === 404) {
            return new AppError(
                `Gemini model "${aiConfig.model}" is unavailable.`,
                {
                    status: 502,
                    code: "AI_MODEL_NOT_FOUND",
                    details: {
                        providerStatus: status,
                        providerMessage: rawMessage,
                        model: aiConfig.model,
                    },
                },
            );
        }

        if (status === 503 || status === 429) {
            return new AppError("Gemini is temporarily overloaded (503).", {
                status: 503,
                code: "AI_RATE_LIMITED",
                details: {
                    providerStatus: status,
                    providerMessage: rawMessage,
                    model: aiConfig.model,
                },
            });
        }

        return new AppError(rawMessage, {
            status: status >= 400 && status < 600 ? 502 : 500,
            code: "AI_PROVIDER_ERROR",
            details: { providerStatus: status, providerMessage: rawMessage },
        });
    }

    /**
     * @private
     * @param {number} ms Sleep time in milliseconds.
     * @returns {Promise<void>}
     */
    #sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Calls Gemini with retries
     * @private
     * @param {import("@google/genai").GoogleGenAI} client
     * @param {object} request Request options for the chat completion request.
     * @returns {Promise<object>} Response from the AI provider.
     * @throws {Error}
     */
    async #generateContentWithRetry(client, request) {
        const maxAttempts = aiConfig.retryAttempts;
        let lastError = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            try {
                return await client.models.generateContent(request);
            } catch (error) {
                lastError = error;
                const status = error.status;
                const retryable = status === 503 || status === 429;

                if (!retryable || attempt === maxAttempts) {
                    throw error;
                }

                const delay = aiConfig.retryDelayMs * attempt;
                console.warn(
                    `[AI] Gemini ${status} on attempt ${attempt}/${maxAttempts}. Retrying in ${delay}ms...`,
                );
                await this.#sleep(delay);
            }
        }

        throw lastError;
    }

    /**
     * This method sends a chat completion request to the AI provider.
     * @param {object} requestOptions Request options for the chat completion request.
     * @param {string} requestOptions.model Model to use for the chat completion request.
     * @param {string} [requestOptions.systemInstruction] System instruction for the chat completion request.
     * @param {object[]} requestOptions.contents Contents for the chat completion request.
     * @param {import("@google/genai").FunctionDeclaration[]} [requestOptions.functionDeclarations] Function declarations for the chat completion request.
     * @returns {Promise<{ reply: string, raw: object, toolCalls: object[] }>} Chat completion response.
     * @throws {AppError}
     */
    async sendChatCompletion(requestOptions) {
        // Ensure the AI client is connected
        const client = await this.#ensureClient();

        const {
            model,
            systemInstruction,
            contents,
            functionDeclarations = [],
        } = requestOptions;

        // Build the config for the chat completion request
        const config = {
            ...(systemInstruction ? { systemInstruction } : {}),
            ...(functionDeclarations.length > 0
                ? {
                      tools: [{ functionDeclarations }],
                  }
                : {}),
        };

        // Initialize the current contents and tool calls
        let currentContents = [...contents];
        const toolCalls = [];
        let response = null;

        // Send the chat completion request
        for (let round = 0; round < aiConfig.maxToolRounds; round += 1) {
            try {
                response = await this.#generateContentWithRetry(client, {
                    model,
                    contents: currentContents,
                    config,
                });
            } catch (error) {
                throw this.#toProviderError(error);
            }

            // Extract the function calls from the response
            const functionCalls = response.functionCalls ?? [];

            if (functionCalls.length === 0) {
                return {
                    reply: this.#normalizeReply(
                        this.#extractReplyText(response),
                    ),
                    raw: response,
                    toolCalls,
                };
            }

            const candidateContent = response.candidates?.[0]?.content;
            if (!candidateContent) {
                throw new AppError(
                    "Gemini returned function calls without a valid candidate response.",
                    {
                        status: 502,
                        code: "AI_EMPTY_CANDIDATE",
                    },
                );
            }

            currentContents.push(candidateContent);

            for (const functionCall of functionCalls) {
                // Execute the tool
                const result = await executeTool(
                    functionCall.name,
                    functionCall.args ?? {},
                );

                // Add the tool call to the tool calls
                toolCalls.push({
                    name: functionCall.name,
                    args: functionCall.args ?? {},
                    result,
                });

                // Add the tool call to the current contents
                currentContents.push({
                    role: ROLES.USER,
                    parts: [
                        {
                            functionResponse: {
                                name: functionCall.name,
                                response: result,
                                id: functionCall.id,
                            },
                        },
                    ],
                });
            }
        }

        // If the tool calling exceeded the maximum number of rounds, throw an error
        throw new AppError(
            "Gemini tool calling exceeded the maximum number of rounds.",
            {
                status: 502,
                code: "AI_TOOL_LOOP_EXCEEDED",
                details: { maxToolRounds: aiConfig.maxToolRounds, toolCalls },
            },
        );
    }
}

const aiClient = new AIClient();
export default aiClient;
