import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [GET] /api/dashboard/customer/orders, [GET] /api/dashboard/customer/orders/:id

export const useGetCustomerOrders = () => {
    // TODO: implement paginated
};

export const useGetCustomerOrderById = () => {
    // TODO: implement query
};

