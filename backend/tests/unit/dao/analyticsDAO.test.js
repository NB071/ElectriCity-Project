import { jest } from "@jest/globals";
import { createMockPool, mockDbModule } from "../helpers/mockPool.js";
import { ConflictError } from "../../../utils/errors.js";

const { execute, getPool } = createMockPool();
await mockDbModule(getPool);

const trackDAO = (
    await import("../../../services/analytics/_track/trackDAO.js")
).default;

describe("trackDAO", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("insertEvent stringifies meta when present and leaves null otherwise", async () => {
        execute.mockResolvedValueOnce([{ insertId: 10 }, []]);
        await expect(
            trackDAO.insertEvent({
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
        await trackDAO.insertEvent({ event_type_id: 1 });
        expect(execute.mock.calls[1][1]).toEqual([1, null, null, null, null]);
    });

    test("insertEvent maps duplicate insert to ConflictError", async () => {
        execute.mockRejectedValueOnce({
            code: "ER_DUP_ENTRY",
            message: "dup",
        });
        await expect(
            trackDAO.insertEvent({ event_type_id: 1, meta: { a: 1 } }),
        ).rejects.toBeInstanceOf(ConflictError);
    });

    test("findAllEventTypes returns ordered event types", async () => {
        execute.mockResolvedValueOnce([
            [
                {
                    event_type_id: 1,
                    code: "cart.add",
                    name: "Cart Add",
                    description: "Adds to cart",
                    is_active: 1,
                },
            ],
            [],
        ]);

        const rows = await trackDAO.findAllEventTypes();
        expect(rows[0].code).toBe("cart.add");
        expect(execute.mock.calls[0][0]).toContain("ORDER BY event_type_id ASC");
    });

    test("countEvents applies date window only by default", async () => {
        execute.mockResolvedValueOnce([[{ total: "15" }], []]);

        const total = await trackDAO.countEvents({
            start: "2025-01-01",
            end: "2025-01-31",
        });

        expect(total).toBe(15);
        expect(execute.mock.calls[0][1]).toEqual([
            "2025-01-01",
            "2025-01-31",
        ]);
        expect(execute.mock.calls[0][0]).not.toContain("el.event_type_id = ?");
    });

    test("countEvents applies optional filters", async () => {
        execute.mockResolvedValueOnce([[{ total: "2" }], []]);

        await trackDAO.countEvents({
            start: "2025-01-01",
            end: "2025-01-31",
            event_type_id: 3,
            user_id: 7,
            cid: 9,
            q: "Tesla",
        });

        expect(execute.mock.calls[0][1]).toEqual([
            "2025-01-01",
            "2025-01-31",
            3,
            7,
            9,
            "%Tesla%",
            "%Tesla%",
            "%Tesla%",
            "%Tesla%",
        ]);
        const sql = execute.mock.calls[0][0];
        expect(sql).toContain("el.event_type_id = ?");
        expect(sql).toContain("el.user_id = ?");
        expect(sql).toContain("el.cid = ?");
        expect(sql).toContain("et.code LIKE ?");
    });

    test("findEvents returns rows with limit and offset", async () => {
        execute.mockResolvedValueOnce([
            [
                {
                    event_id: 100,
                    event_code: "catalog.view",
                    event_type_name: "View",
                    user_id: 1,
                    cid: 2,
                    catalog_name: "Tesla Model 3",
                    ip_address: "127.0.0.1",
                    created_at: "2025-01-15",
                },
            ],
            [],
        ]);

        const rows = await trackDAO.findEvents(
            {
                start: "2025-01-01",
                end: "2025-01-31",
                user_id: 1,
            },
            20,
            40,
        );

        expect(rows[0].event_id).toBe(100);
        expect(execute.mock.calls[0][0]).toContain("LIMIT 20 OFFSET 40");
        expect(execute.mock.calls[0][1]).toEqual([
            "2025-01-01",
            "2025-01-31",
            1,
        ]);
    });

    test("countEvents returns 0 when total is missing", async () => {
        execute.mockResolvedValueOnce([[{}], []]);
        await expect(
            trackDAO.countEvents({ start: "2025-01-01", end: "2025-01-31" }),
        ).resolves.toBe(0);
    });

    test("countByEventType groups and limits", async () => {
        execute.mockResolvedValueOnce([
            [{ event_type_id: 1, code: "cart.add", name: "Cart Add", total: 9 }],
            [],
        ]);

        const rows = await trackDAO.countByEventType(
            "2025-01-01",
            "2025-01-31",
            5,
        );
        expect(rows[0].code).toBe("cart.add");
        expect(execute.mock.calls[0][0]).toContain("LIMIT 5");
        expect(execute.mock.calls[0][1]).toEqual(["2025-01-01", "2025-01-31"]);
    });

    test("topCatalogItemsByEvent joins catalog and limits", async () => {
        execute.mockResolvedValueOnce([
            [{ cid: 2, name: "Tesla Model 3", item_type: "vehicle", total: 4 }],
            [],
        ]);

        const rows = await trackDAO.topCatalogItemsByEvent(
            3,
            "2025-01-01",
            "2025-01-31",
            10,
        );
        expect(rows[0].cid).toBe(2);
        expect(execute.mock.calls[0][0]).toContain("LIMIT 10");
        expect(execute.mock.calls[0][1]).toEqual([
            3,
            "2025-01-01",
            "2025-01-31",
        ]);
    });

    test("dailyTrend returns day buckets", async () => {
        execute.mockResolvedValueOnce([
            [{ day: "2025-01-02", total: 3 }],
            [],
        ]);

        const rows = await trackDAO.dailyTrend(3, "2025-01-01", "2025-01-31");
        expect(rows[0].day).toBe("2025-01-02");
        expect(execute.mock.calls[0][1]).toEqual([
            3,
            "2025-01-01",
            "2025-01-31",
        ]);
    });

    test("findActiveEventTypeIds returns active rows", async () => {
        execute.mockResolvedValueOnce([[{ event_type_id: 1 }], []]);

        const rows = await trackDAO.findActiveEventTypeIds();
        expect(rows[0].event_type_id).toBe(1);
        expect(execute.mock.calls[0][0]).toContain("is_active = TRUE");
    });

    test("findEventById returns first row", async () => {
        execute.mockResolvedValueOnce([
            [
                {
                    event_id: 50,
                    event_code: "catalog.view",
                    brand_name: "Tesla",
                    model_name: "Model 3",
                },
            ],
            [],
        ]);

        const row = await trackDAO.findEventById(50);
        expect(row.event_id).toBe(50);
        expect(execute.mock.calls[0][1]).toEqual([50]);
        expect(execute.mock.calls[0][0]).toContain("WHERE el.event_id = ?");
    });

    test.each([
        [true, 1],
        [false, 0],
    ])(
        "updateEventTypeActive coerces isActive=%s to %s",
        async (isActive, expected) => {
            execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

            await trackDAO.updateEventTypeActive(4, isActive);
            expect(execute.mock.calls[0][1]).toEqual([expected, 4]);
            expect(execute.mock.calls[0][0]).toContain(
                "UPDATE event_type SET is_active = ?",
            );
        },
    );
});
