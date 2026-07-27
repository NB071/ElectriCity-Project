import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [GET] /api/dashboard/admin/orders, [GET] /api/dashboard/admin/orders/:id

export const useGetAdminOrders = (page : number = 1, limit: number = 20) => {
    return usePaginatedQuery({
        queryKey: ["admin", "orders"],
        url: "/api/dashboard/admin/orders",
        method: "get",
        page,
        limit
    })
};

export const useGetAdminOrderById = (id: string) => {
    return useApiQuery({
        queryKey: ["admin", "orders", id],
        url: `/api/dashboard/admin/orders/${id}`,
        method: "get"
    })
};

