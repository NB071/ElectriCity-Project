// Queue Service
// Strategy pattern / producer registry & context
import emailProducer from "./EmailProducer.js";
import analyticsProducer from "./AnalyticsProducer.js";
import ProducerContext from "./ProducerContext.js";
import { QUEUES } from "../constants.js";

/**
 * Registry of available producer strategies, keyed by producer name.
 */
const strategies = {
    [QUEUES.EMAIL.PRODUCER_NAME]: emailProducer,
    [QUEUES.ANALYTICS.PRODUCER_NAME]: analyticsProducer,
};

/**
 * This looks up a producer strategy by name and returns it wrapped in a context.
 * @param {string} name - Producer name from QUEUES constants
 * @returns {ProducerContext} (Strategy pattern)
 * @throws {Error} If no producer is registered under the given name
 */
function getProducer(name) {
    const strategy = strategies[name];

    if (!strategy) {
        throw new Error(
            `Unknown producer "${name}". Registered: ${Object.keys(strategies).join(", ")}`,
        );
    }

    const context = new ProducerContext();
    context.setStrategy(strategy);
    return context;
}

export default getProducer;
