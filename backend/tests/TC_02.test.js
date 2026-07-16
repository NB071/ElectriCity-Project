/**
 * TC_02 - Catalog Service - Filtering and Sorting
 * UC2 / UC3
 */
import catalogService from "../services/catalog/catalog.service.js";

describe("TC_02 Catalog Service - Filtering and Sorting (UC2/UC3)", () => {
    test("filters by brand_id", async () => {
        const result = await catalogService.browseVehicles({
            page: 1,
            limit: 10,
            brand_id: 1,
        });
        expect(result.items.length).toBeGreaterThanOrEqual(1);
        expect(result.items.every((item) => item.brand.name === "Tesla")).toBe(
            true,
        );
    });

    test("filters by promo independently of sort", async () => {
        const result = await catalogService.browseVehicles({
            page: 1,
            limit: 10,
            promo: catalogService.PROMO_TYPES.HOT_DEAL,
        });
        expect(result.items.length).toBeGreaterThanOrEqual(1);
        expect(
            result.items.every((item) =>
                item.promotions.some((p) => p.name === "hot_deal"),
            ),
        ).toBe(true);
    });

    test("sorts by price_asc independently of filters", async () => {
        const result = await catalogService.browseVehicles({
            page: 1,
            limit: 20,
            sort: "price_asc",
        });
        expect(result.sort).toBe("price_asc");
        expect(result.items.length).toBeGreaterThanOrEqual(1);

        const prices = result.items.map((item) => Number(item.base_price));
        const sorted = [...prices].sort((a, b) => a - b);
        expect(prices).toEqual(sorted);
    });

    test("combines keyword search with condition filter", async () => {
        const result = await catalogService.searchVehicles({
            q: "Tesla",
            page: 1,
            limit: 10,
            condition: "used",
        });
        expect(result.items.length).toBeGreaterThanOrEqual(1);
        expect(
            result.items.every((item) => item.vehicle?.condition === "used"),
        ).toBe(true);
    });

    test("applies promo filter independently of other filters", async () => {
        const clearance = await catalogService.browseVehicles({
            page: 1,
            limit: 10,
            promo: catalogService.PROMO_TYPES.CLEARANCE,
        });
        expect(clearance.items.length).toBeGreaterThanOrEqual(1);
        expect(
            clearance.items.every((item) =>
                item.promotions.some((p) => p.name === "clearance"),
            ),
        ).toBe(true);
    });
});
