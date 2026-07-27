import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [GET] /api/dashboard/customer/payments, [GET] /api/dashboard/admin/payments

export const useGetCustomerPayments = (page : number = 1, limit: number = 20) => {
    return usePaginatedQuery({
        queryKey : ["customer", "payments"],
        url: "/api/dashboard/customer/payments",
        method: "get",
        page,
        limit
    })
};

export const useGetAdminPayments = (page : number = 1, limit: number = 20) => {
    return usePaginatedQuery({
        queryKey : ["admin", "payments"],
        url: "/api/dashboard/admin/payments",
        method: "get",
        page,
        limit
    })
};


