import { jest } from "@jest/globals";
import { createMockPool, mockDbModule } from "../helpers/mockPool.js";
import { NotFoundError } from "../../../utils/errors.js";

const { execute, getPool } = createMockPool();
await mockDbModule(getPool);

const dashboardDAO = (
    await import("../../../services/analytics/_dashboard/dashboardDAO.js")
).default;

describe("dashboardDAO", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getAdminKPIs aggregates four queries with number coercion", async () => {
        execute
            .mockResolvedValueOnce([[{ totalRevenue: "1000.50" }], []])
            .mockResolvedValueOnce([[{ totalOrders: "42" }], []])
            .mockResolvedValueOnce([[{ totalUsers: 10 }], []])
            .mockResolvedValueOnce([[{ averageOrderValue: null }], []]);

        const kpis = await dashboardDAO.getAdminKPIs();

        expect(kpis).toEqual({
            totalRevenue: 1000.5,
            totalOrders: 42,
            totalUsers: 10,
            averageOrderValue: 0,
        });
        expect(execute).toHaveBeenCalledTimes(4);
    });

    test("getOrdersByStatus returns rows", async () => {
        execute.mockResolvedValueOnce([
            [
                { status: "pending", count: "3" },
                { status: "delivered", count: 7 },
            ],
            [],
        ]);

        const rows = await dashboardDAO.getOrdersByStatus();
        expect(rows).toHaveLength(2);
        expect(execute.mock.calls[0][0]).toContain("GROUP BY order_status");
    });

    test("getRevenueTrend returns trend rows", async () => {
        execute.mockResolvedValueOnce([
            [{ date: "2025-01-01", revenue: "500" }],
            [],
        ]);

        const rows = await dashboardDAO.getRevenueTrend();
        expect(rows[0].revenue).toBe("500");
        expect(execute.mock.calls[0][0]).toContain("INTERVAL 30 DAY");
    });

    test("getRecentOrders applies limit in SQL", async () => {
        execute.mockResolvedValueOnce([
            [
                {
                    order_id: 1,
                    total: "99.99",
                    order_status: "pending",
                    created_at: "2025-01-01",
                    first_name: "Ada",
                    last_name: "Lovelace",
                },
            ],
            [],
        ]);

        const rows = await dashboardDAO.getRecentOrders(3);
        expect(rows).toHaveLength(1);
        expect(execute.mock.calls[0][0]).toContain("LIMIT 3");
    });

    test("getCustomerKPIs aggregates user metrics", async () => {
        execute
            .mockResolvedValueOnce([[{ totalAmountSpent: "250.00" }], []])
            .mockResolvedValueOnce([
                [{ is_active: 1, created_at: "2024-06-01" }],
                [],
            ])
            .mockResolvedValueOnce([
                [{ totalOrders: "5", activeOrders: "2", completedOrders: "3" }],
                [],
            ])
            .mockResolvedValueOnce([[{ itemCount: "4" }], []]);

        const kpis = await dashboardDAO.getCustomerKPIs(7);

        expect(kpis).toEqual({
            totalAmountSpent: 250,
            accountStatus: "active",
            memberSince: "2024-06-01",
            totalOrders: 5,
            activeOrders: 2,
            completedOrders: 3,
            wishlistItemCount: 4,
        });
        expect(execute.mock.calls[1][1]).toEqual([7]);
    });

    test("getCustomerKPIs marks inactive account and zero wishlist", async () => {
        execute
            .mockResolvedValueOnce([[{ totalAmountSpent: null }], []])
            .mockResolvedValueOnce([
                [{ is_active: 0, created_at: "2023-01-01" }],
                [],
            ])
            .mockResolvedValueOnce([
                [{ totalOrders: null, activeOrders: null, completedOrders: null }],
                [],
            ])
            .mockResolvedValueOnce([[{ itemCount: null }], []]);

        const kpis = await dashboardDAO.getCustomerKPIs(9);

        expect(kpis.accountStatus).toBe("inactive");
        expect(kpis.totalAmountSpent).toBe(0);
        expect(kpis.wishlistItemCount).toBe(0);
    });

    test("getCustomerKPIs throws when user missing", async () => {
        execute
            .mockResolvedValueOnce([[{ totalAmountSpent: 0 }], []])
            .mockResolvedValueOnce([[], []]);

        await expect(dashboardDAO.getCustomerKPIs(404)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test("getRecentOrdersByUser scopes by user and limit", async () => {
        execute.mockResolvedValueOnce([
            [
                {
                    order_id: 10,
                    total: "120",
                    order_status: "shipped",
                    created_at: "2025-02-01",
                    itemCount: 2,
                },
            ],
            [],
        ]);

        const rows = await dashboardDAO.getRecentOrdersByUser(7, 2);
        expect(rows[0].itemCount).toBe(2);
        expect(execute.mock.calls[0][0]).toContain("WHERE o.user_id = ?");
        expect(execute.mock.calls[0][0]).toContain("LIMIT 2");
        expect(execute.mock.calls[0][1]).toEqual([7]);
    });
});
