import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [GET] /api/dashboard/admin/orders, [GET] /api/dashboard/admin/orders/:id

export const useGetAdminOrders = () => {
    // TODO: implement paginated
};

export const useGetAdminOrderById = () => {
    // TODO: implement query
};

