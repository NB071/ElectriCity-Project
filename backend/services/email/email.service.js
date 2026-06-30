// Email Service (Facade)
// Delegates to the queue service's email producer strategy

import { getProducer } from "../queue/queue.service.js";
import { QUEUES } from "../queue/queue.service.js";

// This function is used to send emails
async function sendEmail({ to, template, vars }) {
    const job = await getProducer(QUEUES.EMAIL.PRODUCER_NAME).produce({
        to,
        template,
        vars,
    });
    return { jobId: job.id, queueName: QUEUES.EMAIL.QUEUE_NAME };
}

export default sendEmail;
