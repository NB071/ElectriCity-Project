// Queue Service
// Constants

/* Resources used:
 * https://docs.bullmq.io/guide/queues/auto-removal-of-jobs#keep-jobs-based-on-their-age
 * https://docs.bullmq.io/guide/retrying-failing-jobs#exponential
 */

// Note: Each queue has at most 1 unique worker label.

// Queue (BullMQ) Constants
const QUEUES = {
    // > Email Queue Constants
    EMAIL: {
        QUEUE_NAME: "mailing",
        PRODUCER_NAME: "email",
        WORKER_LABEL: "email-sender",
        JOBS: {
            SEND: "email:send",
        },
        OPTIONS: {
            attempts: 3,
            backoff: { type: "exponential", delay: 1000 },
            removeOnComplete: {
                age: 1 * 3600, // 1 hour
                count: 100,
            },
            removeOnFail: {
                age: 1 * 3600, // 1 hour
            },
        },
    },

    // > Analytics Queue Constants
    ANALYTICS: {
        QUEUE_NAME: "analytics",
        PRODUCER_NAME: "analytics",
        WORKER_LABEL: "analytics-capture",
        JOBS: {
            CAPTURE: "analytics:capture",
        },
        OPTIONS: {
            attempts: 3,
            backoff: { type: "exponential", delay: 1000 },
            removeOnComplete: {
                age: 1 * 3600,
                count: 500,
            },
            removeOnFail: {
                age: 1 * 3600,
            },
        },
    },
};

export { QUEUES };
