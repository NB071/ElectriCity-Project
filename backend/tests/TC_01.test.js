/**
 * TC_01 - Catalog Service - Vehicle Browsing
 * UC1: View Listed Vehicles in Catalog
 *
 * Initial: vehicle data in DB; catalog online; auth optional.
 * Expected: list of vehicles with names, images, prices; empty list OK when none exist.
 */
import catalogService from "../services/catalog/catalog.service.js";

describe("TC_01 Catalog Service - Vehicle Browsing (UC1)", () => {
    test("browseVehicles returns paginated vehicles with name/image/price fields", async () => {
        const result = await catalogService.browseVehicles({
            page: 1,
            limit: 10,
        });

        expect(Array.isArray(result.items)).toBe(true);
        expect(result.pagination.total).toBeGreaterThanOrEqual(0);
        expect(result.sort).toBe("added_desc");

        if (result.items.length === 0) {
            expect(result.pagination.total).toBe(0);
            return;
        }

        expect(result.pagination.total).toBeGreaterThanOrEqual(1);
        for (const item of result.items) {
            expect(item.item_type).toBe("vehicle");
            expect(
                item.name || item.brand?.name || item.model?.name,
            ).toBeTruthy();
            expect(Array.isArray(item.promotions)).toBe(true);
            expect(item.base_price).toEqual(expect.any(Number));
            // images may be represented as primary_image_url on browse cards
            expect(
                item.primary_image_url === null ||
                    typeof item.primary_image_url === "string",
            ).toBe(true);
        }
    });

    test("browse works without authentication (guest-accessible)", async () => {
        const result = await catalogService.browseVehicles({
            page: 1,
            limit: 5,
        });
        expect(result).toHaveProperty("items");
        expect(result).toHaveProperty("pagination");
    });
});
