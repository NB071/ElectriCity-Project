/** @type {import('jest').Config} */
const config = {
    testEnvironment: "node",
    roots: ["<rootDir>/tests"],
    testMatch: ["**/TC_*.test.js", "**/unit/**/*.test.js"],
    transform: {},
    moduleFileExtensions: ["js", "json"],
    collectCoverageFrom: [
        "services/**/*.js",
        "middlewares/**/*.js",
        "utils/**/*.js",
        "!**/node_modules/**",
        "!services/chatbot/AIClient.js",
        "!services/chatbot/builder/**",
        "!services/chatbot/promptMutation.js",
        "!services/email/EmailDirector.js",
        "!services/email/EmailTemplate*.js",
        "!services/email/SMTPClient.js",
        "!utils/sentryHelpers.js",
        "!services/queue/_workers/**",
        "!**/PromoStrategy.js",
        "!**/ToolStrategy.js",
        "!**/MediaStrategy.js",
        "!**/CheckoutStrategy.js",
        "!**/PaymentStrategy.js",
        "!**/ProducerStrategy.js",
        "!**/QueueStrategy.js",
        "!utils/logger.js",
        "!services/analytics/analyticsCache.js",
    ],
    coverageThreshold: {
        global: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
    coverageDirectory: "tests/coverage",
    coverageReporters: ["text", "text-summary", "lcov", "html"],
    testTimeout: 60000,
    maxWorkers: 1, // since db rows gets locked during tests (transactions)
    verbose: true,
    forceExit: true,
    detectOpenHandles: false,
};

export default config;
