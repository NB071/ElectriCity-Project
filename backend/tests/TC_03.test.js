/**
 * TC_03 - Catalog Service - View Full Details
 * UC4
 */
import catalogService from "../services/catalog/catalog.service.js";

describe("TC_03 Catalog Service - View Full Details (UC4)", () => {
    test("returns full vehicle payload for cid=1", async () => {
        const detail = await catalogService.getCatalogItemDetails(1);

        expect(detail.id).toBe(1);
        expect(detail.item_type).toBe("vehicle");
        expect(Array.isArray(detail.images)).toBe(true);
        expect(Array.isArray(detail.promotions)).toBe(true);
        expect(Array.isArray(detail.customizations)).toBe(true);
        expect(detail.vehicle).toBeTruthy();
    });

    test("includes history when the vehicle has a recorded history (cid=2)", async () => {
        const detail = await catalogService.getCatalogItemDetails(2);

        expect(detail.vehicle.condition).toBe("used");
        expect(detail.history).not.toBeNull();
        expect(typeof detail.history.has_accidents).toBe("boolean");
        expect(detail.history.owners_count).toBeGreaterThanOrEqual(0);
    });

    test("unknown cid fails with not-found rather than crashing", async () => {
        await expect(
            catalogService.getCatalogItemDetails(99999),
        ).rejects.toThrow(/Catalog item|not found/i);
    });
});
