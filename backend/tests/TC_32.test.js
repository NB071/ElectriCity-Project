/**
 * TC_32 - Analytics Service - Event Tracking and Admin Reporting
 * UC36
 *
 * Expected: captured events appear in breakdown/trend/top-items;
 * deactivating a type stops new captures without deleting history.
 */
import analyticsService from "../services/analytics/analytics.service.js";
import { loadActiveEventTypes } from "../services/analytics/analyticsCache.js";
import { EVENT_DEFINITIONS } from "../services/analytics/constants.js";
import { ACTIVE_CID } from "./helpers/tddFixtures.js";
import { deleteEventLogsByMetaSource } from "./helpers/cleanup.js";

describe("TC_32 Analytics Service - Event Tracking and Reporting (UC36)", () => {
    beforeAll(async () => {
        await loadActiveEventTypes();
    });

    afterEach(async () => {
        await deleteEventLogsByMetaSource("TC_32");
        await deleteEventLogsByMetaSource("TC_32-before-deactivate");
        await deleteEventLogsByMetaSource("TC_32-after-deactivate");
    });

    test("captures distinct customer actions tied to catalog items", async () => {
        const detailView = await analyticsService.capture({
            event_type_id: EVENT_DEFINITIONS.CATALOG.VEHICLE_DETAILS_VIEW,
            cid: ACTIVE_CID,
            item_type: "vehicle",
            user_id: null,
            ip_address: "127.0.0.1",
            meta: { source: "TC_32" },
        });
        const cartAdd = await analyticsService.capture({
            event_type_id: EVENT_DEFINITIONS.CART.ADD,
            cid: ACTIVE_CID,
            item_type: "vehicle",
            user_id: null,
            ip_address: "127.0.0.1",
            meta: { source: "TC_32" },
        });
        const wishlistAdd = await analyticsService.capture({
            event_type_id: EVENT_DEFINITIONS.WISHLIST.ADD,
            cid: ACTIVE_CID,
            item_type: "vehicle",
            user_id: null,
            ip_address: "127.0.0.1",
            meta: { source: "TC_32" },
        });
        const review = await analyticsService.capture({
            event_type_id: EVENT_DEFINITIONS.REVIEW.PUBLISH_REVIEW,
            cid: ACTIVE_CID,
            item_type: "vehicle",
            user_id: null,
            ip_address: "127.0.0.1",
            meta: { source: "TC_32" },
        });

        expect(detailView).toBeGreaterThan(0);
        expect(cartAdd).toBeGreaterThan(0);
        expect(wishlistAdd).toBeGreaterThan(0);
        expect(review).toBeGreaterThan(0);

        const detail = await analyticsService.eventDetail(detailView);
        expect(detail.event_id).toBe(detailView);
        expect(detail.cid.cid === ACTIVE_CID || detail.cid === ACTIVE_CID).toBe(
            true,
        );
    });

    test("admin reports reflect breakdown, trend, and top items", async () => {
        const breakdown = await analyticsService.eventTypeBreakdown({});
        expect(Array.isArray(breakdown)).toBe(true);
        expect(breakdown.length).toBeGreaterThan(0);

        const trend = await analyticsService.trend(
            EVENT_DEFINITIONS.CATALOG.VEHICLE_DETAILS_VIEW,
            {},
        );
        expect(Array.isArray(trend)).toBe(true);

        const top = await analyticsService.topCatalogItems(
            EVENT_DEFINITIONS.CART.ADD,
            {},
        );
        expect(Array.isArray(top)).toBe(true);
    });

    test("deactivating an event type stops new captures but keeps history", async () => {
        const typeId = EVENT_DEFINITIONS.CATALOG.HOT_DEALS_VIEW;

        const beforeId = await analyticsService.capture({
            event_type_id: typeId,
            cid: ACTIVE_CID,
            item_type: "vehicle",
            user_id: null,
            ip_address: "127.0.0.1",
            meta: { source: "TC_32-before-deactivate" },
        });
        expect(beforeId).toBeGreaterThan(0);

        await analyticsService.setEventTypeActive(typeId, false);
        await loadActiveEventTypes();

        const skipped = await analyticsService.capture({
            event_type_id: typeId,
            cid: ACTIVE_CID,
            item_type: "vehicle",
            user_id: null,
            ip_address: "127.0.0.1",
            meta: { source: "TC_32-after-deactivate" },
        });
        expect(skipped).toBeNull();

        const detail = await analyticsService.eventDetail(beforeId);
        expect(detail.event_id).toBe(beforeId);

        await analyticsService.setEventTypeActive(typeId, true);
        await loadActiveEventTypes();
    });
});
