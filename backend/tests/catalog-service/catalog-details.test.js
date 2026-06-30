// Catalog item details tests
// script: npm run test:catalog:details

import catalogService from "../../services/catalog/catalog.service.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function testVehicleDetailsWithPromotionsAndImages() {
    const detail = await catalogService.getCatalogItemDetails(1);

    assert(detail.id === 1, "detail id should match cid");
    assert(detail.item_type === "vehicle", "item_type should be vehicle");
    assert(Array.isArray(detail.promotions), "promotions should be an array");
    assert(
        detail.promotions.some((promo) => promo.name === "hot_deal"),
        "cid 1 should include hot_deal promotion",
    );
    assert(Array.isArray(detail.images), "images should be an array");
    assert(
        Array.isArray(detail.customizations),
        "customizations should be grouped by category",
    );

    console.log("SUCCESS: getCatalogItemDetails returns vehicle with promos and images");
    console.log("getCatalogItemDetails (cid=1) data:", JSON.stringify(detail, null, 2));
}

async function testVehicleDetailsWithHistoryReport() {
    const detail = await catalogService.getCatalogItemDetails(2);

    assert(detail.vehicle.condition === "used", "cid 2 should be a used vehicle");
    assert(detail.history !== null, "cid 2 should include vehicle history");
    assert(
        typeof detail.history.has_accidents === "boolean",
        "history.has_accidents should be boolean",
    );
    assert(detail.history.report !== null, "cid 2 should resolve history PDF report");
    assert(
        detail.promotions.some((promo) => promo.name === "clearance"),
        "cid 2 should include clearance promotion",
    );

    console.log("SUCCESS: getCatalogItemDetails returns history report and promos");
    console.log("getCatalogItemDetails (cid=2) data:", JSON.stringify(detail, null, 2));
}

async function testVehicleDetailsNotFound() {
    try {
        await catalogService.getCatalogItemDetails(99999);
        throw new Error("expected not found");
    } catch (error) {
        assert(
            error.message.includes("Catalog item") ||
                error.message.includes("not found"),
            `unexpected error: ${error.message}`,
        );
        console.log("SUCCESS: getCatalogItemDetails rejects unknown cid");
    }
}

(async () => {
    try {
        await testVehicleDetailsWithPromotionsAndImages();
        await testVehicleDetailsWithHistoryReport();
        await testVehicleDetailsNotFound();
        console.log("\nAll catalog-details tests passed.");
    } catch (error) {
        console.error("FAIL:", error.message);
        console.error(
            "Hint: npm run docker:up && npm run db:schema:apply && npm run db:seed:apply",
        );
        process.exit(1);
    }
})();
