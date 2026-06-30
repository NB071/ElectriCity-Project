// Email Worker | Queue Service
/* Resources used:
 * https://docs.bullmq.io/guide/workers
 */
import { Worker } from "bullmq";
import { redisConfig } from "../../../configs/redis.js";
import { QUEUES } from "../constants.js";
import processEmailJob from "./processors/EmailProcessor.js";

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
        async (job) => processEmailJob(job.data),
        {
            connection: { ...redisConfig },
            concurrency: 2,
            name: QUEUES.EMAIL.WORKER_LABEL,
        },
    );

    // Log when a job is completed.
    emailWorker.on("completed", (job) => {
        console.log(`[${QUEUES.EMAIL.QUEUE_NAME}] job ${job.id} completed`);
    });

    // Log when a job fails.
    emailWorker.on("failed", (job, error) => {
        console.error(
            `[Service: Queue] ${QUEUES.EMAIL.QUEUE_NAME} job ${job?.id} failed:`,
            error.message,
        );
    });

    console.log(
        `[Queue: Email] worker listening on queue "${QUEUES.EMAIL.QUEUE_NAME}"`,
    );

    return emailWorker;
}

export default startEmailWorker;
