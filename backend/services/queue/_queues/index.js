// Queue Service
// Queue registry & strategy context

import emailQueue from "./EmailQueue.js";
import analyticsQueue from "./AnalyticsQueue.js";
import QueueContext from "./QueueContext.js";
import { QUEUES } from "../constants.js";

/**
 * Registry of available queue strategies, key'ed by queue name.
 */
const strategies = {
    [QUEUES.EMAIL.QUEUE_NAME]: emailQueue,
    [QUEUES.ANALYTICS.QUEUE_NAME]: analyticsQueue,
};

/**
 * This looks up a queue strategy by name and returns it wrapped in a context.
 * @param {string} name - Queue name from QUEUES constants (key'ed by queue name)
 * @returns {QueueContext} (Strategy pattern)
 * @throws {Error} If no queue is registered under the given name
 */
function getQueue(name) {
    const strategy = strategies[name];

    if (!strategy) {
        throw new Error(
            `Unknown queue "${name}". Registered: ${Object.keys(strategies).join(", ")}`,
        );
    }

    const context = new QueueContext();
    context.setStrategy(strategy);
    return context;
}

export default getQueue;
