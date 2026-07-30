import { toAdminOverviewDTO } from "../../../services/analytics/_dashboard/DTOs/adminOverviewDTO.js";
import { toCustomerOverviewDTO } from "../../../services/analytics/_dashboard/DTOs/customerOverviewDTO.js";

describe("dashboard DTOs", () => {
    test("toAdminOverviewDTO nulls empty customer names and coerces counts", () => {
        const dto = toAdminOverviewDTO({
            kpis: {
                totalRevenue: 100,
                totalOrders: 5,
                totalUsers: 2,
                averageOrderValue: 20,
            },
            ordersByStatusRaw: [{ status: "pending", count: "3" }],
            recentOrders: [
                {
                    order_id: 9,
                    total: "45.50",
                    order_status: "pending",
                    created_at: "2025-01-01",
                    first_name: "",
                    last_name: "",
                },
                {
                    order_id: 10,
                    total: "10",
                    order_status: "delivered",
                    created_at: "2025-01-02",
                    first_name: "Ada",
                    last_name: "Lovelace",
                },
            ],
            revenueTrendRaw: [
                { date: new Date("2025-01-01T12:00:00.000Z"), revenue: "50" },
                { date: "2025-01-02", revenue: null },
            ],
        });

        expect(dto.recentActivity[0].customerName).toBeNull();
        expect(dto.recentActivity[1].customerName).toBe("Ada Lovelace");
        expect(dto.recentActivity[0].total).toBe(45.5);
        expect(dto.ordersByStatus[0].count).toBe(3);
        expect(dto.revenueTrend[0].date).toBe("2025-01-01");
        expect(dto.revenueTrend[1].revenue).toBe(0);
    });

    test("toCustomerOverviewDTO maps inactive account and empty wishlist", () => {
        const dto = toCustomerOverviewDTO({
            kpis: {
                totalAmountSpent: 0,
                accountStatus: "inactive",
                memberSince: "2023-05-01",
                totalOrders: 0,
                activeOrders: 0,
                completedOrders: 0,
                wishlistItemCount: 0,
            },
            recentOrders: [],
        });

        expect(dto.accountSummary.status).toBe("inactive");
        expect(dto.wishlistStats.itemCount).toBe(0);
        expect(dto.recentOrders).toEqual([]);
    });

    test("toCustomerOverviewDTO coerces order totals and item counts", () => {
        const dto = toCustomerOverviewDTO({
            kpis: {
                totalAmountSpent: 99,
                accountStatus: "active",
                memberSince: "2024-01-01",
                totalOrders: 1,
                activeOrders: 1,
                completedOrders: 0,
                wishlistItemCount: 2,
            },
            recentOrders: [
                {
                    order_id: 3,
                    total: "75.25",
                    order_status: "confirmed",
                    itemCount: "4",
                    created_at: "2025-02-01T00:00:00.000Z",
                },
            ],
        });

        expect(dto.recentOrders[0]).toEqual({
            orderId: "ORD-3",
            total: 75.25,
            status: "confirmed",
            itemCount: 4,
            createdAt: "2025-02-01T00:00:00.000Z",
        });
    });
});
