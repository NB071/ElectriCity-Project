/*
    Shared Sentry helpers for HTTP + BullMQ workers.
    
    Resources:
    - https://docs.sentry.io/platforms/javascript/enriching-events/scopes/
    - https://docs.sentry.io/platforms/javascript/guides/node/enriching-events/tags/
    - https://docs.sentry.io/platforms/react-native/enriching-events/context/#structured-context
    - https://docs.sentry.io/platforms/javascript/guides/node/configuration/hooks/
    - https://docs.sentry.io/platforms/javascript/data-management/sensitive-data/#scrubbing-data
    - https://docs.sentry.io/platforms/javascript/guides/node/enriching-events/request-isolation/
    - https://docs.sentry.io/platforms/javascript/migration/v7-to-v8/v8-new-performance-api/
*/

import * as Sentry from "@sentry/node";
import { AppError } from "./errors.js";

const PAYMENT_KEY_PATTERN =
    /card|cvv|cvc|pan|payment|stripe|token|password|secret|authorization|email|phone|address|billing/i;

/**
 * This function checks if an error should be reported to Sentry.
 * Error's (or AppError's) class instance with a status code >= 500 should be reported to Sentry.
 * @param {Error|AppError} error
 * @returns {boolean}
 */
function isReportableError(error) {
    if (error instanceof AppError) {
        return Number(error.status) >= 500;
    }
    return true;
}

/**
 * This function attaches safe request/domain context (user_id + cid only) to the Sentry scope.
 * @param {{ user_id?: number|string|null, cid?: number|string|null }} [ctx]
 */
function setSafeContext(ctx = {}) {
    const scope = Sentry.getCurrentScope();
    if (ctx.user_id != null) {
        scope.setTag("user_id", String(ctx.user_id));
        scope.setUser({ id: String(ctx.user_id) });
    }
    if (ctx.cid != null) {
        scope.setTag("cid", String(ctx.cid));
        scope.setContext("catalog", { cid: ctx.cid });
    }
}

/**
 * Recursively replace sensitive keys with "[Filtered]".
 * @param {unknown} value
 * @returns {unknown}
 */
function scrubSensitive(value) {
    // if the value is an array, loop through the array and scrub each element.
    if (Array.isArray(value)) {
        return value.map(scrubSensitive);
    }

    // if the value is not an object, return it as is.
    if (!value || typeof value !== "object") {
        return value;
    }

    // if the value is an object, loop through the object and scrub each key recursively.
    const cleaned = {};
    for (const [key, nested] of Object.entries(value)) {
        cleaned[key] = PAYMENT_KEY_PATTERN.test(key)
            ? "[Filtered]"
            : scrubSensitive(nested);
    }
    return cleaned;
}

/**
 * This function is a beforeSend hook that drops 4xx AppErrors and scrubs sensitive payloads.
 * @param {import('@sentry/node').ErrorEvent} event
 * @param {import('@sentry/node').EventHint} hint
 * @returns {import('@sentry/node').ErrorEvent|null}
 */
function beforeSend(event, hint) {
    // get the original exception from the hint.
    const original = hint?.originalException;

    // if the original exception is not a reportable error, return null.
    if (!isReportableError(original)) {
        return null;
    }

    // if the event has a request, delete the data and cookies and scrub the headers.
    if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
        if (event.request.headers) {
            for (const header of Object.keys(event.request.headers)) {
                // if the header is a payment key, replace it with "[Filtered]".
                if (PAYMENT_KEY_PATTERN.test(header)) {
                    event.request.headers[header] = "[Filtered]";
                }
            }
        }
    }

    // if the event has extra or contexts, scrub the sensitive keys.
    if (event.extra) {
        event.extra = scrubSensitive(event.extra);
    }

    // if the event has contexts, scrub the sensitive keys.
    if (event.contexts) {
        event.contexts = scrubSensitive(event.contexts);
    }

    return event;
}

/**
 * This function captures a worker failure with safe queue metadata only.
 * @param {Error|AppError} error The error to capture.
 * @param {{ queue: string, jobId?: string|null, jobName?: string|null, user_id?: number|null, cid?: number|null }} meta
 */
function captureWorkerException(error, meta) {
    // if the error is not a reportable error, return early.
    if (!isReportableError(error)) {
        return;
    }

    // each worker runs in an isolated scope. This prevents the error from being attached to the main process.
    Sentry.withIsolationScope(() => {
        // attach safe context to the Sentry scope.
        setSafeContext({ user_id: meta.user_id, cid: meta.cid });

        // set the queue tag.
        Sentry.setTag("queue", meta.queue);

        // set the job id tag.
        if (meta.jobId != null) {
            Sentry.setTag("job_id", String(meta.jobId));
        }

        // set the job name tag.
        if (meta.jobName != null) {
            Sentry.setTag("job_name", String(meta.jobName));
        }

        // set the queue context.
        Sentry.setContext("queue_job", {
            queue: meta.queue,
            job_id: meta.jobId ?? null,
            job_name: meta.jobName ?? null,
        });

        // capture the error.
        Sentry.captureException(error);
    });
}

/**
 * This function runs a BullMQ processor inside an isolated Sentry span.
 * @template T The type of the data returned by the processor.
 * @param {{ queue: string, job: import('bullmq').Job }} opts The queue and job to run.
 * @param {(data: object) => Promise<T>} processor The function to run the job.
 * @returns {Promise<T>} The data returned by the processor.
 */
async function runWorkerJob({ queue, job }, processor) {
    // each worker runs in an isolated scope. This prevents the error from being attached to the main process.
    return Sentry.withIsolationScope(() =>
        Sentry.startSpan(
            {
                name: `${queue} ${job.name || "process"}`,
                op: "queue.process",
                forceTransaction: true,
                attributes: {
                    "messaging.system": "bullmq",
                    "messaging.destination.name": queue,
                    "messaging.message.id": String(job.id ?? "unknown"),
                },
            },
            async () => {
                const user_id = job.data?.user_id ?? null;
                const cid = job.data?.cid ?? null;
                setSafeContext({ user_id, cid });
                try {
                    return await processor(job.data);
                } catch (error) {
                    captureWorkerException(error, {
                        queue,
                        jobId: job.id,
                        jobName: job.name,
                        user_id,
                        cid,
                    });
                    throw error;
                }
            },
        ),
    );
}

export {
    isReportableError,
    setSafeContext,
    scrubSensitive,
    beforeSend,
    captureWorkerException,
    runWorkerJob,
};
