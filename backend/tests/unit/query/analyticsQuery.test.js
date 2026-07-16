import { jest } from "@jest/globals";

const mockCountByEventType = jest.fn();
const mockTopCatalogItemsByEvent = jest.fn();
const mockDailyTrend = jest.fn();
const mockFindEventById = jest.fn();

await jest.unstable_mockModule(
    "../../../services/analytics/analyticsDAO.js",
    () => ({
        default: {
            countByEventType: mockCountByEventType,
            topCatalogItemsByEvent: mockTopCatalogItemsByEvent,
            dailyTrend: mockDailyTrend,
            findEventById: mockFindEventById,
        },
    }),
);

const {
    eventTypeBreakdown,
    topCatalogItems,
    trend,
    eventDetail,
} = await import("../../../services/analytics/analyticsQuery.js");
const { ValidationError } = await import("../../../utils/errors.js");

describe("analyticsQuery", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("eventTypeBreakdown delegates to DAO with validated params", async () => {
        mockCountByEventType.mockResolvedValue([{ code: "cart.add", total: 5 }]);

        const rows = await eventTypeBreakdown({
            start: "2025-01-01",
            end: "2025-01-31",
            limit: 10,
        });

        expect(rows).toHaveLength(1);
        expect(mockCountByEventType).toHaveBeenCalledWith(
            "2025-01-01",
            "2025-01-31",
            10,
        );
    });

    test("eventTypeBreakdown propagates DAO errors", async () => {
        mockCountByEventType.mockRejectedValue(new Error("db down"));

        await expect(eventTypeBreakdown({})).rejects.toThrow("db down");
    });

    test("topCatalogItems and trend call DAO with validated window", async () => {
        mockTopCatalogItemsByEvent.mockResolvedValue([{ cid: 1, total: 2 }]);
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
    });

    test("eventDetail rejects invalid id", async () => {
        await expect(eventDetail(0)).rejects.toBeInstanceOf(ValidationError);
        expect(mockFindEventById).not.toHaveBeenCalled();
    });
});
