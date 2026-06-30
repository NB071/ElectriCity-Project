// Catalog compare tests
// script: npm run test:catalog:compare

import catalogService from "../../services/catalog/catalog.service.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function testCompareVehicles() {
    const matrix = await catalogService.compareCatalogItems({
        cids: "1,2",
    });

    assert(Array.isArray(matrix.columns), "compare result should include columns");
    assert(matrix.columns.length === 2, "compare should include two columns");
    assert(Array.isArray(matrix.rows), "compare should include comparable rows");

    console.log("SUCCESS: compareCatalogItems returns comparison matrix");
    console.log("compareCatalogItems data:", JSON.stringify(matrix, null, 2));
}

async function testCompareRejectsSingleItem() {
    try {
        await catalogService.compareCatalogItems({ cids: "1" });
        throw new Error("expected validation to fail");
    } catch (error) {
        assert(
            error.message.includes("Compare requires") ||
                error.message.includes("at least"),
            `unexpected error: ${error.message}`,
        );
        console.log("SUCCESS: compareCatalogItems rejects fewer than two items");
    }
}

async function testCompareRejectsUnknownItem() {
    try {
        await catalogService.compareCatalogItems({ cids: "1,99999" });
        throw new Error("expected not found");
    } catch (error) {
        assert(
            error.message.includes("Catalog item") ||
                error.message.includes("not found"),
            `unexpected error: ${error.message}`,
        );
        console.log("SUCCESS: compareCatalogItems rejects unknown catalog item");
    }
}

(async () => {
    try {
        await testCompareVehicles();
        await testCompareRejectsSingleItem();
        await testCompareRejectsUnknownItem();
        console.log("\nAll catalog-compare tests passed.");
    } catch (error) {
        console.error("FAIL:", error.message);
        console.error(
            "Hint: npm run docker:up && npm run db:schema:apply && npm run db:seed:apply",
        );
        process.exit(1);
    }
})();
