import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [GET] /api/dashboard/admin/orders, [GET] /api/dashboard/admin/orders/:id

export const useGetAdminOrders = () => {
    return usePaginatedQuery({
        queryKey: ["admin", "orders"],
        url: "/api/dashbaord/admin/orders",
        method: "get"
    })
};

export const useGetAdminOrderById = (id: string) => {
    return useApiQuery({
        queryKey: ["admin", "orders", id],
        url: `/api/dashbaord/admin/orders/${id}`,
        method: "get"
    })
};

