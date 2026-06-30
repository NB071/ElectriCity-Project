// Catalog browse tests
// script: npm run test:catalog:browse

import catalogService from "../../services/catalog/catalog.service.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function testBrowseDefault() {
    const result = await catalogService.browseVehicles({ page: 1, limit: 10 });

    assert(Array.isArray(result.items), "items should be an array");
    assert(result.items.length >= 1, "seed should include at least one vehicle");
    assert(result.pagination.total >= 1, "pagination.total should be >= 1");
    assert(result.sort === "added_desc", "default sort should be added_desc");
    assert(
        result.items.every((item) => item.item_type === "vehicle"),
        "browse should return vehicle items only",
    );
    assert(
        result.items.every((item) => Array.isArray(item.promotions)),
        "each item should include a promotions array",
    );

    console.log("SUCCESS: browseVehicles returns paginated vehicle list");
    console.log("browseVehicles data:", JSON.stringify(result, null, 2));
}

async function testBrowseWithPromoFilter() {
    const result = await catalogService.browseVehicles({
        page: 1,
        limit: 10,
        promo: catalogService.PROMO_TYPES.HOT_DEAL,
    });

    assert(result.items.length >= 1, "hot_deal filter should match seeded items");
    assert(
        result.items.every((item) =>
            item.promotions.some((promo) => promo.name === "hot_deal"),
        ),
        "filtered items should include hot_deal promotion labels",
    );

    console.log("SUCCESS: browseVehicles filters by promo label");
    console.log("browseVehicles (hot_deal) data:", JSON.stringify(result, null, 2));
}

async function testBrowseWithBrandFilter() {
    const result = await catalogService.browseVehicles({
        page: 1,
        limit: 10,
        brand_id: 1,
    });

    assert(result.items.length >= 1, "Tesla brand filter should match seeded items");
    assert(
        result.items.every((item) => item.brand.name === "Tesla"),
        "all items should belong to Tesla",
    );

    console.log("SUCCESS: browseVehicles filters by brand_id");
    console.log("browseVehicles (brand_id=1) data:", JSON.stringify(result, null, 2));
}

async function testBrowseRejectsInvalidPagination() {
    try {
        await catalogService.browseVehicles({ page: 0, limit: 10 });
        throw new Error("expected validation to fail");
    } catch (error) {
        assert(
            error.message.includes("pagination") ||
                error.message.includes("Invalid"),
            `unexpected error: ${error.message}`,
        );
        console.log("SUCCESS: browseVehicles rejects invalid pagination");
    }
}

(async () => {
    try {
        await testBrowseDefault();
        await testBrowseWithPromoFilter();
        await testBrowseWithBrandFilter();
        await testBrowseRejectsInvalidPagination();
        console.log("\nAll browse-vehicles tests passed.");
    } catch (error) {
        console.error("FAIL:", error.message);
        console.error(
            "Hint: npm run docker:up && npm run db:schema:apply && npm run db:seed:apply",
        );
        process.exit(1);
    }
})();
