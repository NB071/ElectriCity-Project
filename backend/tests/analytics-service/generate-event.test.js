// Analytics event capture tests
// script: npm run test:analytics:event

import analyticsService from "../../services/analytics/analytics.service.js";
import { loadActiveEventTypes } from "../../services/analytics/analyticsCache.js";
import { EVENT_DEFINITIONS } from "../../services/analytics/constants.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function testCaptureEvent() {
    await loadActiveEventTypes();

    const eventId = await analyticsService.capture({
        event_type_id: EVENT_DEFINITIONS.CATALOG.HOT_DEALS_VIEW,
        user_id: null,
        ip_address: "127.0.0.1",
        meta: { source: "generate-event.test.js" },
    });

    assert(eventId > 0, "event_id should be a positive integer");
    console.log("SUCCESS: capture inserts event_logs row, event_id =", eventId);
}

async function testCaptureRejectsInvalidPayload() {
    await loadActiveEventTypes();

    try {
        await analyticsService.capture({
            event_type_id: EVENT_DEFINITIONS.CATALOG.HOT_DEALS_VIEW,
            user_id: -1,
        });
        throw new Error("expected validation to fail");
    } catch (error) {
        assert(
            error.message.includes("Too small") ||
                error.message.includes("user_id"),
            `unexpected error: ${error.message}`,
        );
        console.log("SUCCESS: capture rejects invalid payload");
    }
}

async function testCaptureSkipsInactiveType() {
    await loadActiveEventTypes();

    const eventId = await analyticsService.capture({ event_type_id: 999 });
    assert(eventId === null, "unknown/inactive event type should return null");
    console.log("SUCCESS: capture skips inactive event type");
}

async function testEventDetail() {
    await loadActiveEventTypes();

    const eventId = await analyticsService.capture({
        event_type_id: EVENT_DEFINITIONS.CATALOG.HOT_DEALS_VIEW,
        cid: 1,
        item_type: "vehicle",
        user_id: null,
        ip_address: "127.0.0.1",
        meta: { source: "eventDetail.test" },
    });

    const detail = await analyticsService.eventDetail(eventId);

    assert(detail.event_id === eventId, "event_id should match");
    assert(detail.event_code === "hot_deals_view", "event_code should match");
    assert(
        detail.event_type_name === "Hot Deals View",
        "event type name should match",
    );
    assert(
        detail.meta.source === "eventDetail.test",
        "meta should be returned",
    );
    assert(detail.ip === "127.0.0.1", "ip should match");
    assert(detail.cid.cid === 1, "cid should match");

    console.log("SUCCESS: eventDetail returns full event payload");
    console.log("eventDetail data:", JSON.stringify(detail, null, 2));
}

(async () => {
    try {
        await testCaptureEvent();
        await testCaptureRejectsInvalidPayload();
        await testCaptureSkipsInactiveType();
        await testEventDetail();
        console.log("\nAll generate-event tests passed.");
    } catch (error) {
        console.error("FAIL:", error.message);
        console.error(
            "Hint: npm run docker:up && npm run db:schema:apply && npm run db:seed:apply",
        );
        process.exit(1);
    }
})();
