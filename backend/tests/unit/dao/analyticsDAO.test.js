import { jest } from "@jest/globals";
import { createMockPool, mockDbModule } from "../helpers/mockPool.js";
import { ConflictError } from "../../../utils/errors.js";

const { execute, getPool } = createMockPool();
await mockDbModule(getPool);

const analyticsDAO = (
    await import("../../../services/analytics/analyticsDAO.js")
).default;

describe("analyticsDAO", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("insertEvent stringifies meta when present and leaves null otherwise", async () => {
        execute.mockResolvedValueOnce([{ insertId: 10 }, []]);
        await expect(
            analyticsDAO.insertEvent({
                event_type_id: 1,
                user_id: 2,
                cid: 3,
                meta: { source: "unit" },
                ip_address: "127.0.0.1",
            }),
        ).resolves.toBe(10);
        expect(execute.mock.calls[0][1][3]).toBe(
            JSON.stringify({ source: "unit" }),
        );

        execute.mockResolvedValueOnce([{ insertId: 11 }, []]);
        await analyticsDAO.insertEvent({ event_type_id: 1 });
        expect(execute.mock.calls[1][1]).toEqual([1, null, null, null, null]);
    });

    test("insertEvent maps duplicate insert to ConflictError", async () => {
        execute.mockRejectedValueOnce({
            code: "ER_DUP_ENTRY",
            message: "dup",
        });
        await expect(
            analyticsDAO.insertEvent({ event_type_id: 1, meta: { a: 1 } }),
        ).rejects.toBeInstanceOf(ConflictError);
    });
});
