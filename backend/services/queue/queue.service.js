// Queue Service (facade) with barrel export

export { default as getProducer } from "./_producers/index.js";
export { default as getQueue } from "./_queues/index.js";
export { default as startWorkers } from "./_workers/index.js";
export { QUEUES } from "./constants.js";
