// Catalog search tests
// script: npm run test:catalog:search

import catalogService from "../../services/catalog/catalog.service.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function testSearchByModelName() {
    const result = await catalogService.searchVehicles({
        q: "Model 3",
        page: 1,
        limit: 10,
    });

    assert(result.q === "Model 3", "response should echo search query");
    assert(result.items.length >= 1, "Model 3 search should match seeded items");
    assert(
        result.items.every((item) => item.model.name.includes("Model 3")),
        "results should match the Model 3 name",
    );
    assert(
        result.items.every((item) => Array.isArray(item.promotions)),
        "each item should include a promotions array",
    );

    console.log("SUCCESS: searchVehicles finds vehicles by model name");
    console.log("searchVehicles (Model 3) data:", JSON.stringify(result, null, 2));
}

async function testSearchByBrandName() {
    const result = await catalogService.searchVehicles({
        q: "Tesla",
        page: 1,
        limit: 10,
    });

    assert(result.items.length >= 1, "Tesla search should match seeded items");
    assert(
        result.items.every((item) => item.brand.name === "Tesla"),
        "results should belong to Tesla",
    );

    console.log("SUCCESS: searchVehicles finds vehicles by brand name");
    console.log("searchVehicles (Tesla) data:", JSON.stringify(result, null, 2));
}

async function testSearchWithPromoFilter() {
    const result = await catalogService.searchVehicles({
        q: "Model",
        page: 1,
        limit: 10,
        promo: catalogService.PROMO_TYPES.CLEARANCE,
        condition: "used",
    });

    assert(result.items.length >= 1, "clearance + used search should match seeded items");
    assert(
        result.items.every(
            (item) =>
                item.vehicle?.condition === "used" &&
                item.promotions.some((promo) => promo.name === "clearance"),
        ),
        "results should be used vehicles with clearance label",
    );

    console.log("SUCCESS: searchVehicles combines keyword, promo, and filters");
    console.log(
        "searchVehicles (Model + clearance + used) data:",
        JSON.stringify(result, null, 2),
    );
}

async function testSearchNoResults() {
    const result = await catalogService.searchVehicles({
        q: "NonexistentVehicleXYZ",
        page: 1,
        limit: 10,
    });

    assert(result.items.length === 0, "unknown model search should return empty list");
    assert(result.pagination.total === 0, "total should be 0 for empty search");

    console.log("SUCCESS: searchVehicles returns empty list when nothing matches");
    console.log("searchVehicles (no match) data:", JSON.stringify(result, null, 2));
}

async function testSearchRejectsBlankQuery() {
    try {
        await catalogService.searchVehicles({ q: "", page: 1, limit: 10 });
        throw new Error("expected validation to fail");
    } catch (error) {
        assert(
            error.message.includes("blank") || error.message.includes("q"),
            `unexpected error: ${error.message}`,
        );
        console.log("SUCCESS: searchVehicles rejects blank query");
    }
}

(async () => {
    try {
        await testSearchByModelName();
        await testSearchByBrandName();
        await testSearchWithPromoFilter();
        await testSearchNoResults();
        await testSearchRejectsBlankQuery();
        console.log("\nAll search-vehicles tests passed.");
    } catch (error) {
        console.error("FAIL:", error.message);
        console.error(
            "Hint: npm run docker:up && npm run db:schema:apply && npm run db:seed:apply",
        );
        process.exit(1);
    }
})();
