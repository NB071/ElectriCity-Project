import { useApiQuery } from "@/hooks/use-api";

// Endpoints: [GET] /api/dashboard/customer/analytics/overview

export type CustomerAccountSummary = {
    status: string;
    memberSince: string;
    totalAmountSpent: number;
};

export type CustomerOrderStats = {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
};

export type CustomerWishlistStats = {
    itemCount: number;
};

export type CustomerRecentOrder = {
    orderId: string;
    total: number;
    status: string;
    itemCount: number;
    createdAt: string;
};

export type CustomerAnalyticsOverview = {
    accountSummary: CustomerAccountSummary;
    orderStats: CustomerOrderStats;
    wishlistStats: CustomerWishlistStats;
    recentOrders: CustomerRecentOrder[];
};

const customerAnalyticsKeys = {
    all: ["customer", "analytics"] as const,
    overview: () => [...customerAnalyticsKeys.all, "overview"] as const,
};

// Customer dashboard home overview KPIs and recent orders
export const useGetCustomerAnalytics = () => {
    return useApiQuery<CustomerAnalyticsOverview>({
        queryKey: customerAnalyticsKeys.overview(),
        url: "/api/dashboard/customer/analytics/overview",
        method: "get",
        staleTime: 1000 * 60,
    });
};

export { customerAnalyticsKeys };
