import { jest } from "@jest/globals";

const mockCountByEventType = jest.fn();
const mockTopCatalogItemsByEvent = jest.fn();
const mockDailyTrend = jest.fn();
const mockFindEventById = jest.fn();
const mockCountEvents = jest.fn();
const mockFindEvents = jest.fn();
const mockFindAllEventTypes = jest.fn();

await jest.unstable_mockModule(
    "../../../services/analytics/_track/trackDAO.js",
    () => ({
        default: {
            countByEventType: mockCountByEventType,
            topCatalogItemsByEvent: mockTopCatalogItemsByEvent,
            dailyTrend: mockDailyTrend,
            findEventById: mockFindEventById,
            countEvents: mockCountEvents,
            findEvents: mockFindEvents,
            findAllEventTypes: mockFindAllEventTypes,
        },
    }),
);

const {
    eventTypeBreakdown,
    topCatalogItems,
    trend,
    listEvents,
    listEventTypes,
    eventDetail,
} = await import("../../../services/analytics/_track/trackQuery.js");
const { ValidationError } = await import("../../../utils/errors.js");

describe("trackQuery", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("eventTypeBreakdown delegates to DAO with validated params", async () => {
        mockCountByEventType.mockResolvedValue([
            {
                event_type_id: 1,
                code: "cart.add",
                name: "Cart Add",
                total: 5,
            },
        ]);

        const rows = await eventTypeBreakdown({
            start: "2025-01-01",
            end: "2025-01-31",
            limit: 10,
        });

        expect(rows).toHaveLength(1);
        expect(rows[0]).toEqual({
            event_type_id: 1,
            code: "cart.add",
            name: "Cart Add",
            total: 5,
        });
        expect(mockCountByEventType).toHaveBeenCalledWith(
            "2025-01-01",
            "2025-01-31",
            10,
        );
    });

    test("eventTypeBreakdown propagates DAO errors", async () => {
        mockCountByEventType.mockRejectedValue(new Error("db down"));

        await expect(eventTypeBreakdown()).rejects.toThrow("db down");
    });

    test("topCatalogItems and trend call DAO with validated window", async () => {
        mockTopCatalogItemsByEvent.mockResolvedValue([
            {
                cid: 1,
                name: "Tesla Model 3",
                item_type: "vehicle",
                total: 2,
            },
        ]);
        mockDailyTrend.mockResolvedValue([{ day: "2025-01-01", total: 1 }]);

        const top = await topCatalogItems(3, {
            start: "2025-01-01",
            end: "2025-01-15",
            limit: 5,
        });
        expect(top[0].cid).toBe(1);
        expect(mockTopCatalogItemsByEvent).toHaveBeenCalledWith(
            3,
            "2025-01-01",
            "2025-01-15",
            5,
        );

        const series = await trend(3, {
            start: "2025-01-01",
            end: "2025-01-15",
        });
        expect(series[0].total).toBe(1);
        expect(mockDailyTrend).toHaveBeenCalledWith(
            3,
            "2025-01-01",
            "2025-01-15",
        );
    });

    test("topCatalogItems and trend accept default params object", async () => {
        mockTopCatalogItemsByEvent.mockResolvedValue([]);
        mockDailyTrend.mockResolvedValue([]);

        await expect(topCatalogItems(1)).resolves.toEqual([]);
        await expect(trend(1)).resolves.toEqual([]);
    });

    test("topCatalogItems propagates DAO errors", async () => {
        mockTopCatalogItemsByEvent.mockRejectedValue(new Error("top failed"));

        await expect(
            topCatalogItems(1, { start: "2025-01-01", end: "2025-01-15" }),
        ).rejects.toThrow("top failed");
    });

    test("trend propagates DAO errors", async () => {
        mockDailyTrend.mockRejectedValue(new Error("trend failed"));

        await expect(
            trend(1, { start: "2025-01-01", end: "2025-01-15" }),
        ).rejects.toThrow("trend failed");
    });

    test("listEvents uses defaults when query params omitted", async () => {
        mockCountEvents.mockResolvedValue(0);

        const result = await listEvents();

        expect(result.items).toEqual([]);
        expect(result.pagination.total).toBe(0);
        expect(mockCountEvents).toHaveBeenCalled();
    });

    test("listEvents returns empty items when total is 0", async () => {
        mockCountEvents.mockResolvedValue(0);

        const result = await listEvents({
            start: "2025-01-01",
            end: "2025-01-31",
            page: 1,
            limit: 10,
        });

        expect(result.items).toEqual([]);
        expect(result.pagination.total).toBe(0);
        expect(mockFindEvents).not.toHaveBeenCalled();
    });

    test("listEvents maps rows when total is positive", async () => {
        mockCountEvents.mockResolvedValue(2);
        mockFindEvents.mockResolvedValue([
            {
                event_id: 1,
                event_code: "cart.add",
                event_type_name: "Cart Add",
                user_id: 7,
                cid: 3,
                catalog_name: "Tesla Model 3",
                ip_address: "127.0.0.1",
                created_at: "2025-01-10",
            },
        ]);

        const result = await listEvents({
            start: "2025-01-01",
            end: "2025-01-31",
            user_id: 7,
            page: 2,
            limit: 5,
        });

        expect(result.items).toHaveLength(1);
        expect(result.items[0].event_id).toBe(1);
        expect(result.pagination).toMatchObject({
            page: 2,
            limit: 5,
            total: 2,
        });
        expect(mockFindEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                start: "2025-01-01",
                end: "2025-01-31",
                user_id: 7,
            }),
            5,
            5,
        );
    });

    test("listEvents rejects invalid pagination", async () => {
        await expect(
            listEvents({
                start: "2025-01-01",
                end: "2025-01-31",
                page: 0,
            }),
        ).rejects.toBeInstanceOf(ValidationError);
        expect(mockCountEvents).not.toHaveBeenCalled();
    });

    test("listEvents propagates DAO errors", async () => {
        mockCountEvents.mockRejectedValue(new Error("count failed"));

        await expect(
            listEvents({ start: "2025-01-01", end: "2025-01-31" }),
        ).rejects.toThrow("count failed");
    });

    test("listEventTypes maps event type rows", async () => {
        mockFindAllEventTypes.mockResolvedValue([
            {
                event_type_id: 1,
                code: "cart.add",
                name: "Cart Add",
                description: "Adds to cart",
                is_active: 1,
            },
        ]);

        const rows = await listEventTypes();
        expect(rows[0]).toMatchObject({
            event_type_id: 1,
            code: "cart.add",
            is_active: true,
        });
    });

    test("listEventTypes propagates DAO errors", async () => {
        mockFindAllEventTypes.mockRejectedValue(new Error("types failed"));

        await expect(listEventTypes()).rejects.toThrow("types failed");
    });

    test("eventDetail maps catalog row, string meta, and vehicle subset", async () => {
        mockFindEventById.mockResolvedValue({
            event_id: 42,
            event_code: "cart.add",
            event_type_name: "Cart Add",
            user_id: 7,
            cid: 1,
            item_type: "vehicle",
            base_price: "45000",
            quantity: 2,
            is_active: 1,
            brand_name: "Tesla",
            model_name: "Model 3",
            model_type: "sedan",
            vehicle_year: 2024,
            vehicle_condition: "new",
            vehicle_mileage: 0,
            meta: JSON.stringify({ source: "unit" }),
            ip_address: "127.0.0.1",
            created_at: "2025-01-01T12:00:00.000Z",
        });

        const detail = await eventDetail("42");

        expect(detail.event_id).toBe(42);
        expect(detail.meta).toEqual({ source: "unit" });
        expect(detail.cid.cid).toBe(1);
        expect(detail.cid.is_active).toBe(true);
        expect(detail.cid.vehicle.year).toBe(2024);
    });

    test("eventDetail omits cid and vehicle when not present", async () => {
        mockFindEventById.mockResolvedValue({
            event_id: 99,
            event_code: "iam.edit",
            event_type_name: "Edit Profile",
            user_id: 1,
            cid: null,
            meta: { page: "settings" },
            ip_address: null,
            created_at: "2025-02-01T00:00:00.000Z",
        });

        const detail = await eventDetail(99);

        expect(detail.cid).toBeNull();
        expect(detail.meta).toEqual({ page: "settings" });
        expect(detail.ip).toBeNull();
    });

    test("eventDetail adds vehicle block when only condition is set", async () => {
        mockFindEventById.mockResolvedValue({
            event_id: 100,
            event_code: "catalog.view",
            event_type_name: "View",
            user_id: null,
            cid: 2,
            item_type: "vehicle",
            base_price: "30000",
            quantity: 1,
            is_active: 0,
            brand_name: "Nissan",
            model_name: "Leaf",
            model_type: "hatchback",
            vehicle_year: null,
            vehicle_condition: "used",
            vehicle_mileage: null,
            meta: null,
            ip_address: "10.0.0.1",
            created_at: "2025-02-02T00:00:00.000Z",
        });

        const detail = await eventDetail(100);

        expect(detail.cid.vehicle).toEqual({
            year: null,
            condition: "used",
            mileage: null,
        });
        expect(detail.meta).toEqual({});
    });

    test("eventDetail rejects invalid id", async () => {
        await expect(eventDetail(0)).rejects.toBeInstanceOf(ValidationError);
        expect(mockFindEventById).not.toHaveBeenCalled();
    });
});
