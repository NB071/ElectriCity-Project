// Local Custom Logger for the backend (shown on the console)

import { createLogger, format, transports } from "winston";
import env from "../configs/env.js";
const { combine, timestamp, printf, colorize } = format;

/**
 * This high order function formats the log message to the shape: [Time] [domain] [name] [message] [err]
 * @param {string} timestamp The timestamp of the log
 * @param {string} domain The domain of the log
 * @param {string} name The name of the log
 * @param {string} message The message of the log
 * @param {Error | undefined} err The error of the log
 * @returns {string} The formatted log message
 */
const logFormat = printf(
    ({ timestamp: time, level, domain, name, message, err }) => {
        const prefix = `[${level}] [${time}] [${domain || "-"} - ${name || "-"}] ${message}`;
        if (env.app.NODE_ENV === "development" && err) {
            return `${prefix} ${err.stack || err.message || err}`;
        }
        return prefix;
    },
);

/**
 * logger instance
 */
const logger = createLogger({
    level: env.app.LOG_LEVEL,
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS", utc: true }),
        colorize({ level: true }),
        logFormat,
    ),
    transports: [new transports.Console()],
});

/**
 * Logs a message with the given level, domain, name, message, and error
 * @param {'debug' | 'info' | 'warn' | 'error'} level The level of the log
 * @param {string} domain The domain of the log
 * @param {string} name The name of the log
 * @param {string} message The message of the log
 * @param {Error | undefined} err The error of the log
 */
function log(level, domain, name, message, err) {
    logger.log(level, message, { domain, name, err });
}

export default {
    debug: (domain, name, message, err) =>
        log("debug", domain, name, message, err),
    info: (domain, name, message, err) =>
        log("info", domain, name, message, err),
    warn: (domain, name, message, err) =>
        log("warn", domain, name, message, err),
    error: (domain, name, message, err) =>
        log("error", domain, name, message, err),
};
