// Queue Service
// Worker registry & starter

import startEmailWorker from "./EmailWorker.js";
import startAnalyticsWorker from "./AnalyticsWorker.js";
import { QUEUES } from "../constants.js";

/**
 * Registry of available worker starters, keyed by worker label.
 */
const workerStarters = [
    { label: QUEUES.EMAIL.WORKER_LABEL, start: startEmailWorker },
    { label: QUEUES.ANALYTICS.WORKER_LABEL, start: startAnalyticsWorker },
];

/**
 * This starts all the queue workers.
 * @returns {void}
 * @throws {Error} If a worker fails to start. Will be caught by the main server file index.js.
 */
function startWorkers() {
    // Start each worker.
    for (const { label, start } of workerStarters) {
        start();
        console.log(`Queue worker started: ${label}`);
    }
}

export default startWorkers;
