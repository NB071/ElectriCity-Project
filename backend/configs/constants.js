/*
    This file contains constants used throughout the application.
    Things that'd never change regardless of environment.
*/

const APP_CONSTANTS = {
    EMAIL: {
        DEFAULT_PORT: 587,
    },
    REDIS: {
        DEFAULT_PORT: 6379,
        // TODO: Implement cache if time permits
        // cache: {
        // },
    },
    pagination: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
    },
    AI: {
        DEFAULT_MODEL: "gemini-3.1-flash-lite",
        DEFAULT_MAX_TOOL_ROUNDS: 5,
        DEFAULT_MAX_TOOL_RESULT_CHARS: 12000,
        DEFAULT_RETRY_ATTEMPTS: 3,
        DEFAULT_RETRY_DELAY_MS: 1500,
    },
};

export default APP_CONSTANTS;
