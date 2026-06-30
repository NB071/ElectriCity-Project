// Analytics report tests
// script: npm run test:analytics:report

import analyticsService from "../../services/analytics/analytics.service.js";
import { loadActiveEventTypes } from "../../services/analytics/analyticsCache.js";
import { EVENT_DEFINITIONS } from "../../services/analytics/constants.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function seedOneEvent() {
    await loadActiveEventTypes();
    await analyticsService.capture({
        event_type_id: EVENT_DEFINITIONS.CATALOG.HOT_DEALS_VIEW,
        user_id: null,
        ip_address: "127.0.0.1",
        meta: { source: "generate-report.test.js" },
    });
}

async function testEventTypeBreakdown() {
    const rows = await analyticsService.eventTypeBreakdown({});

    assert(Array.isArray(rows), "eventTypeBreakdown should return an array");

    const hotDeals = rows.find((r) => r.code === "hot_deals_view");
    assert(hotDeals?.total >= 1, "breakdown should include seeded hot_deals_view");

    console.log("SUCCESS: eventTypeBreakdown returns counts by event type");
    console.log("eventTypeBreakdown data:", JSON.stringify(rows, null, 2));
}

async function testTrend() {
    const rows = await analyticsService.trend(
        EVENT_DEFINITIONS.CATALOG.HOT_DEALS_VIEW,
        {},
    );

    assert(Array.isArray(rows), "trend should return an array");
    console.log("SUCCESS: trend returns daily time-series");
    console.log("trend data:", JSON.stringify(rows, null, 2));
}

async function testInvalidDateRange() {
    try {
        await analyticsService.eventTypeBreakdown({
            start: "2026-06-01",
            end: "2026-01-01",
        });
        throw new Error("expected validation to fail");
    } catch (error) {
        assert(
            error.message.includes("start date"),
            `unexpected error: ${error.message}`,
        );
        console.log("SUCCESS: report rejects invalid date range");
    }
}

(async () => {
    try {
        await seedOneEvent();
        await testEventTypeBreakdown();
        await testTrend();
        await testInvalidDateRange();
        console.log("\nAll generate-report tests passed.");
    } catch (error) {
        console.error("FAIL:", error.message);
        console.error(
            "Hint: npm run docker:up && npm run db:schema:apply && npm run db:seed:apply",
        );
        process.exit(1);
    }
})();
