import { jest } from "@jest/globals";

const mockGetAdminKPIs = jest.fn();
const mockGetOrdersByStatus = jest.fn();
const mockGetRecentOrders = jest.fn();
const mockGetRevenueTrend = jest.fn();
const mockGetCustomerKPIs = jest.fn();
const mockGetRecentOrdersByUser = jest.fn();

await jest.unstable_mockModule(
    "../../../services/analytics/_dashboard/dashboardDAO.js",
    () => ({
        default: {
            getAdminKPIs: mockGetAdminKPIs,
            getOrdersByStatus: mockGetOrdersByStatus,
            getRecentOrders: mockGetRecentOrders,
            getRevenueTrend: mockGetRevenueTrend,
            getCustomerKPIs: mockGetCustomerKPIs,
            getRecentOrdersByUser: mockGetRecentOrdersByUser,
        },
    }),
);

const { getAdminOverview, getCustomerOverview } = await import(
    "../../../services/analytics/_dashboard/dashboardQuery.js"
);

describe("dashboardQuery", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getAdminOverview assembles DTO from DAO data", async () => {
        mockGetAdminKPIs.mockResolvedValue({
            totalRevenue: 5000,
            totalOrders: 20,
            totalUsers: 8,
            averageOrderValue: 250,
        });
        mockGetOrdersByStatus.mockResolvedValue([
            { status: "pending", count: "5" },
        ]);
        mockGetRecentOrders.mockResolvedValue([
            {
                order_id: 1,
                total: "100",
                order_status: "pending",
                created_at: "2025-01-01T00:00:00.000Z",
                first_name: "Jane",
                last_name: "Doe",
            },
        ]);
        mockGetRevenueTrend.mockResolvedValue([
            { date: "2025-01-01", revenue: "100" },
        ]);

        const overview = await getAdminOverview();

        expect(overview.kpis).toEqual({
            totalRevenue: 5000,
            totalOrders: 20,
            newUsers: 8,
            averageOrderValue: 250,
        });
        expect(overview.ordersByStatus[0].count).toBe(5);
        expect(overview.recentActivity[0].orderId).toBe("ORD-1");
        expect(mockGetRecentOrders).toHaveBeenCalledWith(5);
    });

    test("getAdminOverview propagates DAO errors", async () => {
        mockGetAdminKPIs.mockRejectedValue(new Error("db down"));

        await expect(getAdminOverview()).rejects.toThrow("db down");
    });

    test("getCustomerOverview assembles DTO for user", async () => {
        mockGetCustomerKPIs.mockResolvedValue({
            totalAmountSpent: 300,
            accountStatus: "active",
            memberSince: "2024-01-01",
            totalOrders: 2,
            activeOrders: 1,
            completedOrders: 1,
            wishlistItemCount: 3,
        });
        mockGetRecentOrdersByUser.mockResolvedValue([
            {
                order_id: 5,
                total: "150",
                order_status: "delivered",
                created_at: "2025-01-15",
                itemCount: 1,
            },
        ]);

        const overview = await getCustomerOverview(42);

        expect(overview.accountSummary.status).toBe("active");
        expect(overview.recentOrders[0].orderId).toBe("ORD-5");
        expect(mockGetCustomerKPIs).toHaveBeenCalledWith(42);
        expect(mockGetRecentOrdersByUser).toHaveBeenCalledWith(42, 5);
    });

    test("getCustomerOverview rejects missing userId", async () => {
        await expect(getCustomerOverview(null)).rejects.toThrow(
            "userId is strictly required.",
        );
        expect(mockGetCustomerKPIs).not.toHaveBeenCalled();
    });

    test("getCustomerOverview propagates DAO errors", async () => {
        mockGetCustomerKPIs.mockRejectedValue(new Error("customer db down"));

        await expect(getCustomerOverview(1)).rejects.toThrow("customer db down");
    });
});
