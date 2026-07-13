// Analytics Worker | Queue Service
/* Resources used:
 * https://docs.bullmq.io/guide/workers
 */
import { Worker } from "bullmq";
import { redisConfig } from "../../../configs/redis.js";
import { QUEUES } from "../constants.js";
import processAnalyticsJob from "./processors/AnalyticsProcessor.js";
import { runWorkerJob } from "../../../utils/sentryHelpers.js";
import log from "../../../utils/logger.js";

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
        async (job) =>
            runWorkerJob(
                { queue: QUEUES.ANALYTICS.QUEUE_NAME, job },
                processAnalyticsJob,
            ),
        {
            connection: { ...redisConfig },
            concurrency: 4,
            name: QUEUES.ANALYTICS.WORKER_LABEL,
        },
    );

    // Log when a job is completed.
    analyticsWorker.on("completed", (job) => {
        log.info(
            "Queue",
            "AnalyticsWorker",
            `${QUEUES.ANALYTICS.QUEUE_NAME} job ${job.id} completed`,
        );
    });

    // Log when a job fails (reportable errors already captured in runWorkerJob).
    analyticsWorker.on("failed", (job, error) => {
        log.error(
            "Queue",
            "AnalyticsWorker",
            `${QUEUES.ANALYTICS.QUEUE_NAME} job ${job?.id} failed`,
            error,
        );
    });

    log.info(
        "Queue",
        "AnalyticsWorker",
        `worker listening on queue "${QUEUES.ANALYTICS.QUEUE_NAME}"`,
    );

    return analyticsWorker;
}

export default startAnalyticsWorker;
