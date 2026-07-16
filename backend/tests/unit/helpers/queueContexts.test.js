import { jest } from "@jest/globals";
import { InternalError } from "../../../utils/errors.js";
import { QUEUES } from "../../../services/queue/constants.js";

const mockAdd = jest.fn().mockResolvedValue({ id: "job-1" });
const MockQueue = jest.fn().mockImplementation(() => ({ add: mockAdd }));

await jest.unstable_mockModule("bullmq", () => ({
    Queue: MockQueue,
}));

await jest.unstable_mockModule("../../../configs/redis.js", () => ({
    redisConfig: { host: "127.0.0.1", port: 6379 },
}));

const QueueContext = (
    await import("../../../services/queue/_queues/QueueContext.js")
).default;
const getQueue = (
    await import("../../../services/queue/_queues/index.js")
).default;
const analyticsQueue = (
    await import("../../../services/queue/_queues/AnalyticsQueue.js")
).default;
const emailQueue = (
    await import("../../../services/queue/_queues/EmailQueue.js")
).default;

const ProducerContext = (
    await import("../../../services/queue/_producers/ProducerContext.js")
).default;
const getProducer = (
    await import("../../../services/queue/_producers/index.js")
).default;

describe("QueueContext / getQueue", () => {
    test("add throws when strategy unset", () => {
        const ctx = new QueueContext();
        expect(() => ctx.add("job", {}, {})).toThrow(InternalError);
    });

    test("getQueue rejects unknown name and wraps known queues", async () => {
        expect(() => getQueue("nope")).toThrow(InternalError);

        const ctx = getQueue(QUEUES.EMAIL.QUEUE_NAME);
        await expect(ctx.add("email:send", { to: "a@b.com" }, {})).resolves.toEqual({
            id: "job-1",
        });
    });

    test("analytics and email queue add delegate to bullmq", async () => {
        await analyticsQueue.add("analytics:capture", { event: "x" }, {});
        await emailQueue.add("email:send", { to: "a@b.com" }, {});
        expect(mockAdd).toHaveBeenCalled();
    });
});

describe("ProducerContext / getProducer", () => {
    test("produce throws when strategy unset", async () => {
        const ctx = new ProducerContext();
        await expect(ctx.produce({})).rejects.toBeInstanceOf(InternalError);
    });

    test("getProducer rejects unknown name", () => {
        expect(() => getProducer("nope")).toThrow(InternalError);
    });

    test("getProducer wraps known producer and delegates", async () => {
        const ctx = new ProducerContext();
        const strategy = {
            produce: jest.fn().mockResolvedValue({ id: "p1" }),
        };
        ctx.setStrategy(strategy);
        await expect(ctx.produce({ a: 1 })).resolves.toEqual({ id: "p1" });

        expect(() => getProducer(QUEUES.EMAIL.PRODUCER_NAME)).not.toThrow();
        expect(() => getProducer(QUEUES.ANALYTICS.PRODUCER_NAME)).not.toThrow();
    });
});
