import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [GET] /api/dashboard/customer/orders, [GET] /api/dashboard/customer/orders/:id

export const useGetCustomerOrders = () => {
    return usePaginatedQuery({
        queryKey : ["customer", "orders"],
        url: "/api/dashboard/customer/orders",
        method: "get"
    })
};

export const useGetCustomerOrderById = (id: string) => {
    return useApiQuery({
        queryKey : ["customer", "orders", id],
        url: `/api/dashboard/customer/orders/${id}`,
        method: "get"
    })
};

