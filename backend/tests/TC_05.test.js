/**
 * TC_05 - Catalog Service - Hot Deals & Promo Labels
 * UC6 (+ Featured / Seasonal promo strategies)
 *
 * Expected: hot_deal / featured / seasonal filters return correctly labeled
 * vehicles, or an empty list when none are flagged.
 */
import catalogService from "../services/catalog/catalog.service.js";

describe("TC_05 Catalog Service - Hot Deals & Promo Labels (UC6)", () => {
    test.each([
        [catalogService.PROMO_TYPES.HOT_DEAL, "hot_deal"],
        [catalogService.PROMO_TYPES.FEATURED, "featured"],
        [catalogService.PROMO_TYPES.SEASONAL, "seasonal"],
    ])(
        "browseVehicles with promo=%s returns only matching vehicles",
        async (promo, label) => {
            const result = await catalogService.browseVehicles({
                page: 1,
                limit: 20,
                promo,
            });

            expect(Array.isArray(result.items)).toBe(true);

            if (result.items.length === 0) {
                expect(result.pagination.total).toBe(0);
                return;
            }

            expect(
                result.items.every((item) =>
                    item.promotions.some((p) => p.name === label),
                ),
            ).toBe(true);
        },
    );

    test("promo listings are accessible without authentication", async () => {
        const result = await catalogService.browseVehicles({
            page: 1,
            limit: 5,
            promo: catalogService.PROMO_TYPES.HOT_DEAL,
        });
        expect(result).toHaveProperty("items");
    });
});
