// Gemini AI configuration
// Resources: https://ai.google.dev/gemini-api/docs

import { GoogleGenAI } from "@google/genai";
import env from "./env.js";
import APP_CONSTANTS from "./constants.js";
import { AppError } from "../utils/errors.js";

export const aiConfig = {
    // Gemini API key
    apiKey: env.ai.apiKey,

    // Gemini model to use
    model: env.ai.model,

    // Max tool execution rounds per request
    maxToolRounds:
        env.ai.maxToolRounds ?? APP_CONSTANTS.AI.DEFAULT_MAX_TOOL_ROUNDS,

    // Max tool result characters per request
    maxToolResultChars:
        env.ai.maxToolResultChars ??
        APP_CONSTANTS.AI.DEFAULT_MAX_TOOL_RESULT_CHARS,

    // Max retry attempts
    retryAttempts:
        env.ai.retryAttempts ?? APP_CONSTANTS.AI.DEFAULT_RETRY_ATTEMPTS,

    // Retry delay in milliseconds
    retryDelayMs:
        env.ai.retryDelayMs ?? APP_CONSTANTS.AI.DEFAULT_RETRY_DELAY_MS,
};

/**
 * Creates and validates the Gemini client for the Developer API (API key auth).
 * @pre API key is correct and valid
 * @returns {GoogleGenAI}
 * @throws {AppError} If the API key is missing or invalid
 */
function configureAIClient() {
    const client = new GoogleGenAI({
        apiKey: aiConfig.apiKey,
        vertexai: false,
    });

    console.log("[AI] Gemini client configured successfully");
    return client;
}

export default configureAIClient;
