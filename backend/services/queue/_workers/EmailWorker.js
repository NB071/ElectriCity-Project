// Email Worker | Queue Service
/* Resources used:
 * https://docs.bullmq.io/guide/workers
 */
import { Worker } from "bullmq";
import { redisConfig } from "../../../configs/redis.js";
import { QUEUES } from "../constants.js";
import processEmailJob from "./processors/EmailProcessor.js";
import { runWorkerJob } from "../../../utils/sentryHelpers.js";
import log from "../../../utils/logger.js";

/** @type {import('bullmq').Worker} */
let emailWorker = null;

/**
 * This starts the email worker.
 * @returns {import('bullmq').Worker}
 */
function startEmailWorker() {
    // If the email worker is already started, return it.
    if (emailWorker) {
        return emailWorker;
    }

    // Create a new email worker.
    emailWorker = new Worker(
        QUEUES.EMAIL.QUEUE_NAME,
        async (job) =>
            runWorkerJob(
                { queue: QUEUES.EMAIL.QUEUE_NAME, job },
                processEmailJob,
            ),
        {
            connection: { ...redisConfig },
            concurrency: 2,
            name: QUEUES.EMAIL.WORKER_LABEL,
        },
    );

    // Log when a job is completed.
    emailWorker.on("completed", (job) => {
        log.info(
            "Queue",
            "EmailWorker",
            `${QUEUES.EMAIL.QUEUE_NAME} job ${job.id} completed`,
        );
    });

    // Log when a job fails (reportable errors already captured in runWorkerJob).
    emailWorker.on("failed", (job, error) => {
        log.error(
            "Queue",
            "EmailWorker",
            `${QUEUES.EMAIL.QUEUE_NAME} job ${job?.id} failed`,
            error,
        );
    });

    log.info(
        "Queue",
        "EmailWorker",
        `worker listening on queue "${QUEUES.EMAIL.QUEUE_NAME}"`,
    );

    return emailWorker;
}

export default startEmailWorker;
