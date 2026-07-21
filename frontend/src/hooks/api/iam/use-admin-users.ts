import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";

    // Endpoints: [GET] /api/dashboard/admin/users, [GET] /api/dashboard/admin/users/:userId

export const useGetAdminUsers = () => {
    // TODO: implement paginated
};

export const useGetAdminUserById = () => {
    // TODO: implement query
};

