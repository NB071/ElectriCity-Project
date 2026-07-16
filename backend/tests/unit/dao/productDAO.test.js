import { jest } from "@jest/globals";
import { createMockPool, mockDbModule } from "../helpers/mockPool.js";
import {
    NotFoundError,
    ValidationError,
} from "../../../utils/errors.js";

const { execute, getPool } = createMockPool();
await mockDbModule(getPool);

const productDAO = (await import("../../../services/catalog/_product/productDAO.js"))
    .default;

describe("productDAO", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("countVehicles rejects unsupported sort", async () => {
        await expect(
            productDAO.countVehicles({}, "not_a_sort"),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test("countVehicles applies filter branches", async () => {
        execute.mockResolvedValueOnce([[{ total: 3 }], []]);

        const total = await productDAO.countVehicles(
            {
                brand_id: 1,
                model_id: 2,
                condition: "new",
                year_min: 2020,
                year_max: 2025,
                price_min: 10000,
                price_max: 90000,
                mileage_max: 50000,
                body_shape: "sedan",
                drivetrain: "AWD",
                search: "Tesla",
            },
            "price_asc",
        );

        expect(total).toBe(3);
        const sql = execute.mock.calls[0][0];
        expect(sql).toContain("COUNT(*)");
        expect(execute.mock.calls[0][1].length).toBeGreaterThan(5);
    });

    test("findVehicles returns rows for supported sort", async () => {
        execute.mockResolvedValueOnce([[{ cid: 1, model_name: "Leaf" }], []]);

        const rows = await productDAO.findVehicles({}, 10, 0, "mileage_desc");
        expect(rows).toHaveLength(1);
        expect(execute.mock.calls[0][0]).toContain("ORDER BY v.mileage DESC");
    });

    test("existsById respects requireActive flag", async () => {
        execute.mockResolvedValueOnce([[{ found: 1 }], []]);
        await expect(
            productDAO.existsById(5, { requireActive: true }),
        ).resolves.toBe(true);
        expect(execute.mock.calls[0][0]).toContain("is_active = TRUE");

        execute.mockResolvedValueOnce([[], []]);
        await expect(productDAO.existsById(5)).resolves.toBe(false);
    });

    test("findManyForCompare short-circuits empty ids", async () => {
        await expect(productDAO.findManyForCompare([])).resolves.toEqual([]);
        expect(execute).not.toHaveBeenCalled();
    });

    test("findVehicleById throws when missing", async () => {
        execute.mockResolvedValueOnce([[], []]);
        await expect(productDAO.findVehicleById(404)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test("findVehicleHistoryByCid returns null when absent", async () => {
        execute.mockResolvedValueOnce([[], []]);
        await expect(productDAO.findVehicleHistoryByCid(1)).resolves.toBeNull();
    });
});
