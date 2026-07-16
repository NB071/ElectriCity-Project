/**
 * TC_04 - Catalog Service - Compare Vehicles
 * UC5
 */
import catalogService from "../services/catalog/catalog.service.js";

describe("TC_04 Catalog Service - Compare Vehicles (UC5)", () => {
    test("returns side-by-side comparison matrix for two vehicles", async () => {
        const matrix = await catalogService.compareCatalogItems({
            cids: "1,2",
        });

        expect(Array.isArray(matrix.columns)).toBe(true);
        expect(matrix.columns.length).toBe(2);
        expect(Array.isArray(matrix.rows)).toBe(true);
        expect(matrix.rows.length).toBeGreaterThan(0);
    });

    test("rejects fewer than two items", async () => {
        await expect(
            catalogService.compareCatalogItems({ cids: "1" }),
        ).rejects.toThrow(/Compare requires|at least/i);
    });

    test("rejects unknown catalog items", async () => {
        await expect(
            catalogService.compareCatalogItems({ cids: "1,99999" }),
        ).rejects.toThrow(/Catalog item|not found/i);
    });
});
