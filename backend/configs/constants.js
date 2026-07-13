/*
    This file contains constants used throughout the application.
    Things that'd never change regardless of environment.
*/

const APP_CONSTANTS = {
    APP: {
        APP_NAME: "ElectriCity Backend API",
        APP_VERSION: "1.0.0",
        DEFAULT_APP_LOG_LEVEL: "info",
        DEFAULT_NODE_ENV: "development",
    },
    SENTRY: {
        DEFAULT_TRACES_SAMPLE_RATE: 0.1,
        DEFAULT_PROFILE_SESSION_SAMPLE_RATE: 0.1,
        DEFAULT_ENABLED: false,
    },
    EMAIL: {
        DEFAULT_PORT: 587,
    },
    REDIS: {
        DEFAULT_PORT: 6379,
        // TODO: Implement cache if time permits on D3
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
