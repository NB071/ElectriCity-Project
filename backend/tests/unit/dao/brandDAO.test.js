import { jest } from "@jest/globals";
import { createMockPool, mockDbModule } from "../helpers/mockPool.js";
import { NotFoundError } from "../../../utils/errors.js";

const { execute, getPool } = createMockPool();
await mockDbModule(getPool);

const brandDAO = (
    await import("../../../services/catalog/_brand/brandDAO.js")
).default;

const brandRow = {
    brand_id: 1,
    name: "Tesla",
    description: "EV maker",
    country: "US",
    website_url: "https://tesla.com",
    media_id: 10,
    is_featured: 1,
    display_order: 1,
    created_at: "2025-01-01",
    updated_at: "2025-01-02",
    logo_url: "https://cdn/logo.png",
    logo_file_type: "image/png",
    logo_alt_text: "Tesla logo",
};

describe("brandDAO", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("countBrands without featured filter", async () => {
        execute.mockResolvedValueOnce([[{ total: "12" }], []]);

        await expect(brandDAO.countBrands()).resolves.toBe(12);
        expect(execute.mock.calls[0][0]).not.toContain("is_featured");
    });

    test.each([
        [true, "is_featured = TRUE"],
        [false, "is_featured = FALSE"],
    ])("countBrands with is_featured=%s", async (featured, sqlFragment) => {
        execute.mockResolvedValueOnce([[{ total: 3 }], []]);

        await expect(
            brandDAO.countBrands({ is_featured: featured }),
        ).resolves.toBe(3);
        expect(execute.mock.calls[0][0]).toContain(sqlFragment);
    });

    test("findLiteBrands returns id/name rows", async () => {
        execute.mockResolvedValueOnce([
            [
                { brand_id: 1, name: "Audi" },
                { brand_id: 2, name: "BMW" },
            ],
            [],
        ]);

        const rows = await brandDAO.findLiteBrands({ is_featured: true });
        expect(rows).toHaveLength(2);
        expect(execute.mock.calls[0][0]).toContain("SELECT b.brand_id, b.name");
        expect(execute.mock.calls[0][0]).toContain("is_featured = TRUE");
    });

    test("findLiteBrands with is_featured=false", async () => {
        execute.mockResolvedValueOnce([[], []]);

        await brandDAO.findLiteBrands({ is_featured: false });
        expect(execute.mock.calls[0][0]).toContain("is_featured = FALSE");
    });

    test("findBrands without pagination omits LIMIT", async () => {
        execute.mockResolvedValueOnce([[brandRow], []]);

        const rows = await brandDAO.findBrands({ is_featured: true });
        expect(rows[0].name).toBe("Tesla");
        expect(execute.mock.calls[0][0]).not.toContain("LIMIT");
    });

    test("findBrands with is_featured=false", async () => {
        execute.mockResolvedValueOnce([[brandRow], []]);

        await brandDAO.findBrands({ is_featured: false });
        expect(execute.mock.calls[0][0]).toContain("is_featured = FALSE");
    });

    test("findBrands with display order and pagination", async () => {
        execute.mockResolvedValueOnce([[brandRow], []]);

        await brandDAO.findBrands(
            {},
            { orderByDisplayOrder: true, limit: 10, offset: 20 },
        );

        const sql = execute.mock.calls[0][0];
        expect(sql).toContain("display_order IS NULL ASC");
        expect(sql).toContain("LIMIT 10 OFFSET 20");
    });

    test("findById returns brand row", async () => {
        execute.mockResolvedValueOnce([[brandRow], []]);

        const row = await brandDAO.findById(1);
        expect(row.brand_id).toBe(1);
        expect(execute.mock.calls[0][1]).toEqual([1]);
    });

    test("findById throws when missing", async () => {
        execute.mockResolvedValueOnce([[], []]);

        await expect(brandDAO.findById(404)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test("findModelsByBrandId returns model rows", async () => {
        execute.mockResolvedValueOnce([
            [
                { model_id: 1, name: "Model 3", release_year: 2024 },
                { model_id: 2, name: "Model Y", release_year: null },
            ],
            [],
        ]);

        const rows = await brandDAO.findModelsByBrandId(1);
        expect(rows).toHaveLength(2);
        expect(execute.mock.calls[0][0]).toContain("WHERE m.brand_id = ?");
        expect(execute.mock.calls[0][1]).toEqual([1]);
    });
});
