// Analytics Worker | Queue Service
/* Resources used:
 * https://docs.bullmq.io/guide/workers
 */
import { Worker } from "bullmq";
import { redisConfig } from "../../../configs/redis.js";
import { QUEUES } from "../constants.js";
import processAnalyticsJob from "./processors/AnalyticsProcessor.js";

/** @type {import('bullmq').Worker} */
let analyticsWorker = null;

/**
 * This starts the analytics worker.
 * @returns {import('bullmq').Worker}
 */
function startAnalyticsWorker() {
    if (analyticsWorker) {
        return analyticsWorker;
    }

    analyticsWorker = new Worker(
        QUEUES.ANALYTICS.QUEUE_NAME,
        async (job) => processAnalyticsJob(job.data),
        {
            connection: { ...redisConfig },
            concurrency: 4,
            name: QUEUES.ANALYTICS.WORKER_LABEL,
        },
    );

    // Log when a job is completed.
    analyticsWorker.on("completed", (job) => {
        console.log(`[${QUEUES.ANALYTICS.QUEUE_NAME}] job ${job.id} completed`);
    });

    // Log when a job fails.
    analyticsWorker.on("failed", (job, error) => {
        console.error(
            `[Service: Queue] ${QUEUES.ANALYTICS.QUEUE_NAME} job ${job?.id} failed:`,
            error.message,
        );
    });

    console.log(
        `[Queue: Analytics] worker listening on queue "${QUEUES.ANALYTICS.QUEUE_NAME}"`,
    );

    return analyticsWorker;
}

export default startAnalyticsWorker;
